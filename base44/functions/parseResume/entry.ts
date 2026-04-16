import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url, file_name } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    // Fetch the file content
    const fileResp = await fetch(file_url);
    if (!fileResp.ok) return Response.json({ error: 'Could not fetch file' }, { status: 400 });

    // Use InvokeLLM with file_urls to extract resume data
    const extracted = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          full_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          location: { type: "string" },
          headline: { type: "string", description: "Current job title or professional headline" },
          summary: { type: "string", description: "Professional summary or bio" },
          skills: {
            type: "array",
            items: { type: "string" },
            description: "All technical and soft skills mentioned"
          },
          experience: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                company: { type: "string" },
                period: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          education: {
            type: "array",
            items: {
              type: "object",
              properties: {
                degree: { type: "string" },
                institution: { type: "string" },
                year: { type: "string" },
                field: { type: "string" }
              }
            }
          },
          certifications: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          years_of_experience: { type: "number" },
          seniority_level: { type: "string", description: "Junior, Mid-level, Senior, Lead, Executive" },
          industry: { type: "string" }
        }
      }
    });

    if (extracted.status !== 'success') {
      return Response.json({ error: extracted.details || 'Extraction failed' }, { status: 500 });
    }

    const data = extracted.output;

    // Update user profile with extracted data
    await base44.auth.updateMe({
      full_name: data.full_name || user.full_name,
      job_title: data.headline || user.job_title,
      skills: data.skills?.join(', ') || user.skills,
      experience_years: data.years_of_experience || user.experience_years,
      resume_parsed: true,
      resume_last_parsed: new Date().toISOString(),
    });

    // Save as a ResumeProject
    const resumeText = JSON.stringify({
      personal: { name: data.full_name, email: data.email, phone: data.phone, location: data.location },
      summary: data.summary,
      experience: data.experience,
      education: data.education,
      skills: data.skills,
      certifications: data.certifications,
    });

    const project = await base44.asServiceRole.entities.ResumeProject.create({
      title: `${data.full_name || 'My'} Resume — Imported`,
      template_name: 'Imported',
      resume_data: resumeText,
      status: 'complete',
    });

    return Response.json({
      success: true,
      data,
      project_id: project.id,
      message: `Successfully extracted ${data.skills?.length || 0} skills, ${data.experience?.length || 0} jobs, ${data.education?.length || 0} education entries.`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});