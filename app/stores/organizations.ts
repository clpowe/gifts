import { defineStore } from "pinia";
import { authClient } from "~/lib/auth-client";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: string;
};

const STORAGE_KEY = "activeOrgId";

export const useOrganizationStore = defineStore("organizations", {
  state: () => ({
    organizations: [] as Organization[],
    activeOrgId: null as string | null,
    loading: false,
    initialized: false,
  }),

  getters: {
    activeOrg(state): Organization | null {
      return (
        state.organizations.find((org) => org.id === state.activeOrgId) ?? null
      );
    },
    hasOrgs(state): boolean {
      return state.organizations.length > 0;
    },
  },

  actions: {
    hydrateFromStorage() {
      if (import.meta.client) {
        this.activeOrgId = localStorage.getItem(STORAGE_KEY);
      }
    },

    persistActive(orgId: string | null) {
      if (!import.meta.client) return;
      if (orgId) localStorage.setItem(STORAGE_KEY, orgId);
      else localStorage.removeItem(STORAGE_KEY);
    },

    async fetchAll() {
      this.loading = true;
      try {
        const orgs = await $fetch<Organization[]>("/api/organizations");
        this.organizations = orgs;
        this.initialized = true;

        if (this.activeOrgId && !orgs.find((o) => o.id === this.activeOrgId)) {
          this.activeOrgId = null;
          this.persistActive(null);
        }

        const [firstOrg] = orgs;
        if (!this.activeOrgId && firstOrg) {
          await this.setActive(firstOrg.id);
        }
      } finally {
        this.loading = false;
      }
    },

    async create(name: string) {
      const org = await $fetch<Organization>("/api/organizations", {
        method: "POST",
        body: { name },
      });
      this.organizations.push(org);
      // Better Auth makes the newly created org active server-side by default
      this.activeOrgId = org.id;
      this.persistActive(org.id);
      return org;
    },

    async setActive(orgId: string) {
      this.activeOrgId = orgId;
      const res = await authClient.organization.setActive({
        organizationId: orgId,
      });
      if (res.error != undefined) {
        throw new Error(res.error.message);
      }
      this.persistActive(orgId);
    },

    async rename(orgId: string, name: string) {
      await $fetch(`/api/organizations/${orgId}`, {
        method: "PATCH",
        body: { name },
      });
      const org = this.organizations.find((o) => o.id === orgId);
      if (org) org.name = name;
    },

    async remove(orgId: string) {
      await $fetch(`/api/organizations/${orgId}`, { method: "DELETE" });

      const wasActive = this.activeOrgId === orgId;
      this.organizations = this.organizations.filter((o) => o.id !== orgId);

      if (wasActive) {
        const nextOrgId = this.organizations[0]?.id ?? null;

        const { error } = await authClient.organization.setActive({
          organizationId: nextOrgId,
        });

        if (error) throw error;

        this.activeOrgId = nextOrgId;
        this.persistActive(nextOrgId);
      }
    },

    async invite(orgId: string, email: string, role: "member" | "owner") {
      return $fetch<{ id: string; email: string; role: string }>(
        `/api/organizations/${orgId}/invitations`,
        {
          method: "POST",
          body: { email, role },
        },
      );
    },
  },
});
