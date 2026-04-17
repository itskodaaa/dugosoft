// Base44 client disabled as part of migration to custom backend
export const base44 = {
  auth: {
    updateMe: async () => ({}),
    getMe: async () => ({})
  },
  integrations: {
    Core: {
      InvokeLLM: async () => ({})
    }
  },
  entities: {
    ResumeProject: {
      create: async () => ({ id: 'mock' }),
      update: async () => ({}),
      list: async () => ([])
    },
    CoverLetter: {
      list: async () => ([])
    },
    Portfolio: {
      filter: async () => ([])
    },
    CVVaultEntry: {
      create: async () => ({ id: 'mock' })
    }
  }
};
