import { useEffect, useMemo, useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Eye,
  Copy,
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
  Send,
  CheckCircle2,
  Search,
  Clock3,
  RotateCcw,
} from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  KpiCard,
  StatusBadge,
} from "@/components/ui/Primitives";
import {
  useWebsiteBuilderWorkspaceQuery,
  useWebsiteBuilderApprovalsQuery,
  useWebsiteBuilderPublishHistoryQuery,
  useSaveWebsiteBuilderWorkspaceMutation,
  useSaveWebsiteBuilderApprovalsMutation,
  useSaveWebsiteBuilderPublishHistoryMutation,
} from "@/services/mock/queries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type {
  WebsiteBuilderApproval,
  WebsiteBuilderDevice,
  WebsiteBuilderPage,
  WebsiteBuilderPublishEvent,
  WebsiteBuilderRoomSync,
  WebsiteBuilderSection,
  WebsiteBuilderThemeOption,
  WebsiteBuilderVersion,
  WebsiteBuilderWorkspace,
} from "@/types/pms";

const DEFAULT_WS: WebsiteBuilderWorkspace = {
  id: "WB-WS-FALLBACK",
  propertyId: "PROP-1",
  siteName: "Property Website",
  selectedPageId: "fallback-home",
  selectedThemeId: "fallback-theme",
  previewDevice: "desktop",
  autosaveEnabled: true,
  pages: [
    {
      id: "fallback-home",
      name: "Home",
      slug: "/",
      status: "Draft",
      seoScore: 80,
      sections: [{ id: "fallback-sec", name: "Hero Banner", type: "hero", visible: true }],
    },
  ],
  themeOptions: [{ id: "fallback-theme", name: "Retrod Classic", category: "Core" }],
  roomSync: [],
  versions: [],
  lastAction: "Initialized",
  lastSavedAt: new Date().toISOString(),
};

function parseScheduledAt(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function countdownLabel(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return "due now";
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function WebsiteBuilderFeature() {
  const { user, can } = useAuth();
  const { data: workspaceDataRaw } = useWebsiteBuilderWorkspaceQuery();
  const { data: approvalsDataRaw } = useWebsiteBuilderApprovalsQuery();
  const { data: publishHistoryDataRaw } = useWebsiteBuilderPublishHistoryQuery();
  const saveWorkspace = useSaveWebsiteBuilderWorkspaceMutation();
  const saveApprovals = useSaveWebsiteBuilderApprovalsMutation();
  const savePublishHistory = useSaveWebsiteBuilderPublishHistoryMutation();

  const workspaceData = workspaceDataRaw as WebsiteBuilderWorkspace | undefined;
  const approvalsData = (approvalsDataRaw ?? []) as WebsiteBuilderApproval[];
  const publishHistoryData = (publishHistoryDataRaw ?? []) as WebsiteBuilderPublishEvent[];

  const workspace = workspaceData ?? DEFAULT_WS;
  const selectedPage: WebsiteBuilderPage =
    workspace.pages.find((page) => page.id === workspace.selectedPageId) ?? workspace.pages[0];
  const sections = selectedPage?.sections ?? [];
  const theme =
    workspace.themeOptions.find(
      (option: WebsiteBuilderThemeOption) => option.id === workspace.selectedThemeId,
    ) ?? workspace.themeOptions[0];

  const [device, setDevice] = useState<WebsiteBuilderDevice>(workspace.previewDevice);
  const [search, setSearch] = useState("");
  const [compareVersionId, setCompareVersionId] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());

  const filteredSections = useMemo(
    () =>
      sections.filter((section) =>
        section.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [sections, search],
  );

  useEffect(() => {
    setDevice(workspace.previewDevice);
  }, [workspace.previewDevice]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const persistWorkspace = (
    nextWorkspace: WebsiteBuilderWorkspace,
    lastAction: string,
    options?: { saveVersion?: boolean },
  ) => {
    const savedAt = new Date().toISOString();
    const nextVersions = options?.saveVersion
      ? [
          {
            id: `wb-ver-${Date.now()}`,
            createdAt: savedAt,
            createdBy: user?.name ?? "General Manager",
            note: lastAction,
            pageId: selectedPage?.id,
            snapshotPages: nextWorkspace.pages,
          },
          ...nextWorkspace.versions,
        ].slice(0, 10)
      : nextWorkspace.versions;

    const payload: WebsiteBuilderWorkspace = {
      ...nextWorkspace,
      versions: nextVersions,
      lastAction,
      lastSavedAt: savedAt,
    };
    saveWorkspace.mutate(payload);
  };

  const updateSections = (
    updater: (current: WebsiteBuilderSection[]) => WebsiteBuilderSection[],
    actionLabel: string,
  ) => {
    if (!selectedPage) return;
    const nextPages = workspace.pages.map((page) =>
      page.id === selectedPage.id ? { ...page, sections: updater(page.sections) } : page,
    );
    persistWorkspace({ ...workspace, pages: nextPages }, actionLabel, { saveVersion: true });
  };

  const publishReadyCount = sections.filter((section) => section.visible).length;
  const pendingApprovals = approvalsData.filter((item) => item.status === "Pending").length;
  const latestPublish = publishHistoryData[0];
  const canApprove = can("websitebuilder.manage") || can("property.configure");
  const approverName = user?.name ?? "Approver";

  const compareVersion = workspace.versions.find((version) => version.id === compareVersionId);
  const versionPage = compareVersion?.snapshotPages?.find((page) => page.id === selectedPage?.id);
  const versionDiff = (() => {
    if (!versionPage || !selectedPage) return null;
    const currentSet = new Set(selectedPage.sections.map((section) => section.name));
    const versionSet = new Set(versionPage.sections.map((section) => section.name));
    let added = 0;
    let removed = 0;
    for (const name of currentSet) {
      if (!versionSet.has(name)) added += 1;
    }
    for (const name of versionSet) {
      if (!currentSet.has(name)) removed += 1;
    }
    return { added, removed, comparedCount: versionPage.sections.length };
  })();

  const scheduledPages = workspace.pages
    .filter((page) => page.scheduledPublishAt)
    .map((page) => {
      const target = parseScheduledAt(page.scheduledPublishAt);
      return {
        ...page,
        countdown: target ? countdownLabel(target) : "invalid schedule",
        due: target ? target.getTime() <= nowTick : false,
      };
    });

  useEffect(() => {
    const duePages = workspace.pages.filter((page) => {
      const target = parseScheduledAt(page.scheduledPublishAt);
      return !!target && target.getTime() <= nowTick;
    });
    if (duePages.length === 0) return;

    const dueIds = new Set(duePages.map((page) => page.id));
    const nextPages = workspace.pages.map((page) =>
      dueIds.has(page.id)
        ? { ...page, status: "Published" as const, scheduledPublishAt: undefined }
        : page,
    );

    const event: WebsiteBuilderPublishEvent = {
      id: `wb-pub-auto-${Date.now()}`,
      publishedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      publishedBy: "Auto Publisher",
      pageCount: duePages.length,
      note: `Auto-published scheduled pages: ${duePages.map((page) => page.name).join(", ")}`,
    };

    const payload: WebsiteBuilderWorkspace = {
      ...workspace,
      pages: nextPages,
      lastPublishedAt: new Date().toISOString(),
    };
    savePublishHistory.mutate([event, ...publishHistoryData]);
    persistWorkspace(payload, `Auto-published ${duePages.length} scheduled page(s)`, {
      saveVersion: true,
    });
  }, [nowTick]); // intentional tick-driven scheduler simulation

  const moveSection = (index: number, dir: -1 | 1) => {
    const nextIndex = index + dir;
    updateSections(
      (current) => {
        if (nextIndex < 0 || nextIndex >= current.length) return current;
        const cloned = [...current];
        const [picked] = cloned.splice(index, 1);
        cloned.splice(nextIndex, 0, picked);
        return cloned;
      },
      `Moved "${sections[index]?.name ?? "section"}" ${dir === -1 ? "up" : "down"}`,
    );
  };

  const duplicateSection = (index: number) => {
    const target = sections[index];
    if (!target) return;
    const duplicate: WebsiteBuilderSection = {
      ...target,
      id: `${target.id}-copy-${Date.now()}`,
      name: `${target.name} (Copy)`,
    };
    updateSections((current) => {
      const cloned = [...current];
      cloned.splice(index + 1, 0, duplicate);
      return cloned;
    }, `Duplicated "${target.name}"`);
  };

  const removeSection = (index: number) => {
    const target = sections[index];
    if (!target) return;
    updateSections((current) => current.filter((_, i) => i !== index), `Removed "${target.name}"`);
  };

  const toggleVisibility = (index: number) => {
    const target = sections[index];
    if (!target) return;
    updateSections(
      (current) =>
        current.map((section, i) =>
          i === index ? { ...section, visible: !section.visible } : section,
        ),
      `${target.visible ? "Hidden" : "Shown"} "${target.name}"`,
    );
  };

  const scheduleSection = (index: number) => {
    const target = sections[index];
    if (!target) return;
    const now = new Date();
    const scheduled = new Date(now.getTime() + 1000 * 60 * 60 * 24);
    updateSections(
      (current) =>
        current.map((section, i) =>
          i === index
            ? { ...section, scheduledAt: scheduled.toISOString().slice(0, 16).replace("T", " ") }
            : section,
        ),
      `Scheduled "${target.name}" for tomorrow`,
    );
  };

  const addSection = () => {
    const nextSection: WebsiteBuilderSection = {
      id: `s-${Date.now()}`,
      name: "Custom Content Block",
      type: "text",
      visible: true,
    };
    updateSections((current) => [...current, nextSection], "Added Custom Content Block");
  };

  const selectPage = (pageId: string) => {
    const page = workspace.pages.find((item) => item.id === pageId);
    if (!page) return;
    const payload: WebsiteBuilderWorkspace = { ...workspace, selectedPageId: pageId };
    persistWorkspace(payload, `Opened "${page.name}" page`);
  };

  const createPage = () => {
    const pageCount = workspace.pages.length + 1;
    const page: WebsiteBuilderPage = {
      id: `wb-page-${Date.now()}`,
      name: `Landing ${pageCount}`,
      slug: `/landing-${pageCount}`,
      status: "Draft",
      seoScore: 70,
      sections: [{ id: `wb-s-${Date.now()}`, name: "Hero Banner", type: "hero", visible: true }],
    };
    const payload: WebsiteBuilderWorkspace = {
      ...workspace,
      pages: [...workspace.pages, page],
      selectedPageId: page.id,
    };
    persistWorkspace(payload, `Created "${page.name}"`, { saveVersion: true });
  };

  const changeTheme = (themeId: string) => {
    const themeOption = workspace.themeOptions.find((option) => option.id === themeId);
    if (!themeOption) return;
    const payload: WebsiteBuilderWorkspace = { ...workspace, selectedThemeId: themeId };
    persistWorkspace(payload, `Applied "${themeOption.name}" theme`);
  };

  const changeDevice = (nextDevice: WebsiteBuilderDevice) => {
    setDevice(nextDevice);
    const payload: WebsiteBuilderWorkspace = { ...workspace, previewDevice: nextDevice };
    persistWorkspace(payload, `Switched preview to ${nextDevice}`);
  };

  const saveDraft = () => {
    persistWorkspace(workspace, "Draft saved", { saveVersion: true });
  };

  const requestApproval = () => {
    if (!selectedPage) return;
    const event: WebsiteBuilderApproval = {
      id: `wb-appr-${Date.now()}`,
      pageName: selectedPage.name,
      requestedBy: user?.name ?? "General Manager",
      requestedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "Pending",
    };
    saveApprovals.mutate([event, ...approvalsData]);
    persistWorkspace(workspace, `Approval requested for "${selectedPage.name}"`);
  };

  const decideApproval = (approvalId: string, status: "Approved" | "Rejected") => {
    if (!canApprove) return;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const nextApprovals = approvalsData.map((item) =>
      item.id === approvalId ? { ...item, status, approver: approverName, decidedAt: now } : item,
    );
    saveApprovals.mutate(nextApprovals);
    persistWorkspace(workspace, `${status} approval request`);
  };

  const restoreVersion = (versionId: string) => {
    const version = workspace.versions.find((item) => item.id === versionId);
    if (!version?.snapshotPages) return;
    const payload: WebsiteBuilderWorkspace = { ...workspace, pages: version.snapshotPages };
    persistWorkspace(payload, `Restored version ${version.id}`, { saveVersion: true });
  };

  const schedulePagePublish = () => {
    if (!selectedPage) return;
    const scheduled = new Date(Date.now() + 1000 * 60 * 60 * 12)
      .toISOString()
      .slice(0, 16)
      .replace("T", " ");
    const nextPages = workspace.pages.map((page) =>
      page.id === selectedPage.id
        ? { ...page, scheduledPublishAt: scheduled, status: "Ready" as const }
        : page,
    );
    persistWorkspace(
      { ...workspace, pages: nextPages },
      `Scheduled publish for "${selectedPage.name}"`,
      {
        saveVersion: true,
      },
    );
  };

  const publish = () => {
    const now = new Date().toISOString();
    const event: WebsiteBuilderPublishEvent = {
      id: `wb-pub-${Date.now()}`,
      publishedAt: now.slice(0, 16).replace("T", " "),
      publishedBy: user?.name ?? "General Manager",
      pageCount: workspace.pages.filter((page) => page.status !== "Draft").length,
      note: `Published changes from ${selectedPage?.name ?? "active"} page`,
    };
    const nextPages = workspace.pages.map((page) =>
      page.id === selectedPage?.id
        ? { ...page, status: "Published" as const, scheduledPublishAt: undefined }
        : page,
    );
    const payload: WebsiteBuilderWorkspace = {
      ...workspace,
      pages: nextPages,
      lastPublishedAt: now,
    };
    savePublishHistory.mutate([event, ...publishHistoryData]);
    persistWorkspace(payload, "Published to live website", { saveVersion: true });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Commercial · Website Builder"
        title="Hotel Website Builder"
        description="Create, customize, preview, and publish hotel websites without code."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={saveDraft}>
              <Save className="h-3.5 w-3.5" />
              Save draft
            </Button>
            <Button variant="outline" size="sm" onClick={requestApproval}>
              <Clock3 className="h-3.5 w-3.5" />
              Request approval
            </Button>
            <Button variant="outline" size="sm" onClick={schedulePagePublish}>
              <Clock3 className="h-3.5 w-3.5" />
              Schedule publish
            </Button>
            <Button size="sm" onClick={publish}>
              <Send className="h-3.5 w-3.5" />
              Publish
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard label="Pages" value={String(workspace.pages.length)} accent="brand" />
          <KpiCard label="Sections live" value={String(publishReadyCount)} accent="success" />
          <KpiCard label="Theme" value={theme?.name ?? "—"} accent="info" />
          <KpiCard label="PMS sync" value="Healthy" accent="success" />
          <KpiCard label="Approvals pending" value={String(pendingApprovals)} accent="warning" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr_320px]">
          <Card>
            <CardHeader title="Pages" hint="Draft + publish control" />
            <div className="space-y-2 p-4">
              <div className="grid grid-cols-2 gap-2">
                {workspace.pages.slice(0, 10).map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => selectPage(page.id)}
                    className={`rounded border px-2 py-1.5 text-[12px] transition ${
                      selectedPage?.id === page.id
                        ? "border-primary bg-primary-tint text-primary"
                        : "border-border text-text-secondary hover:border-primary"
                    }`}
                  >
                    {page.name}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                {scheduledPages.map((page) => (
                  <div
                    key={`sched-${page.id}`}
                    className="rounded border border-border-subtle px-2 py-1 text-[11px] text-text-secondary"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>
                        {page.name} at {page.scheduledPublishAt}
                      </span>
                      <StatusBadge tone={page.due ? "warning" : "info"}>
                        {page.due ? "Publishing..." : page.countdown}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={createPage}>
                <Plus className="h-3.5 w-3.5" />
                Create custom page
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader
              title={`Builder Canvas · ${selectedPage?.name ?? "Page"}`}
              hint="Section-based visual editor"
              action={
                <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
                  {(
                    [
                      { id: "desktop" as const, icon: Monitor },
                      { id: "tablet" as const, icon: Tablet },
                      { id: "mobile" as const, icon: Smartphone },
                    ] as const
                  ).map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => changeDevice(option.id)}
                        className={`rounded p-1.5 ${device === option.id ? "bg-foreground text-background" : "text-text-secondary"}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              }
            />
            <div className="space-y-3 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-disabled" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-full rounded-md border border-border bg-surface pl-8 pr-2 text-[12px]"
                  placeholder="Search sections..."
                />
              </div>
              {filteredSections.map((section, index) => (
                <div key={section.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">
                        {section.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-text-secondary">
                        {section.type.toUpperCase()}
                        {section.scheduledAt ? ` · Scheduled ${section.scheduledAt}` : ""}
                      </div>
                    </div>
                    <StatusBadge tone={section.visible ? "success" : "neutral"}>
                      {section.visible ? "Visible" : "Hidden"}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <Button variant="outline" size="sm" onClick={() => moveSection(index, -1)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => moveSection(index, 1)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateSection(index)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleVisibility(index)}>
                      {section.visible ? "Hide" : "Show"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => scheduleSection(index)}>
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => removeSection(index)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-3.5 w-3.5" />
                Add section
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Theme & Branding" hint="Theme changes do not affect content" />
              <div className="space-y-3 p-4 text-[12px]">
                <label className="block">
                  <div className="mb-1 text-text-secondary">Installed theme</div>
                  <select
                    className="h-8 w-full rounded-md border border-border bg-surface px-2"
                    value={theme?.id ?? ""}
                    onChange={(e) => changeTheme(e.target.value)}
                  >
                    {workspace.themeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button variant="outline" size="sm" className="w-full">
                  Open theme marketplace
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader title="PMS Room Sync" hint="Auto sync + override support" />
              <div className="space-y-2 p-4 text-[12px]">
                {workspace.roomSync.map((row: WebsiteBuilderRoomSync) => (
                  <div key={row.roomType} className="rounded border border-border-subtle px-3 py-2">
                    <div className="font-medium text-text-primary">{row.roomType}</div>
                    <div className="text-text-secondary">PMS updated: {row.pmsUpdatedAt}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge tone={row.webStatus === "Synced" ? "success" : "warning"}>
                        {row.webStatus}
                      </StatusBadge>
                      <span className="text-text-secondary">
                        {row.overrideActive ? "Website override active" : "Auto from PMS"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Workflow" hint="Draft → Preview → Approval → Publish" />
              <div className="space-y-2 p-4 text-[12px]">
                <div className="rounded border border-border-subtle px-3 py-2">
                  <div className="font-medium text-text-primary">Last action</div>
                  <div className="text-text-secondary">{workspace.lastAction}</div>
                </div>
                <div className="rounded border border-border-subtle px-3 py-2">
                  <div className="font-medium text-text-primary">Live status</div>
                  <div className="mt-1 flex items-center gap-2 text-text-secondary">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    CDN healthy · SSL active · Sitemap generated
                  </div>
                </div>
                <div className="rounded border border-border-subtle px-3 py-2">
                  <div className="font-medium text-text-primary">Autosave versions</div>
                  <div className="mt-1 text-text-secondary">
                    {workspace.versions.length} versions · last at{" "}
                    {workspace.versions[0]?.createdAt ?? "—"}
                  </div>
                </div>
                <div className="rounded border border-border-subtle px-3 py-2">
                  <div className="mb-1 font-medium text-text-primary">Compare version</div>
                  <select
                    className="h-8 w-full rounded-md border border-border bg-surface px-2 text-[12px]"
                    value={compareVersionId}
                    onChange={(e) => setCompareVersionId(e.target.value)}
                  >
                    <option value="">Select version</option>
                    {workspace.versions.map((version: WebsiteBuilderVersion) => (
                      <option key={version.id} value={version.id}>
                        {version.id} · {version.createdAt}
                      </option>
                    ))}
                  </select>
                  {versionDiff && (
                    <div className="mt-2 space-y-1 text-[11px] text-text-secondary">
                      <div>Added vs version: {versionDiff.added}</div>
                      <div>Removed vs version: {versionDiff.removed}</div>
                      <div>Version section count: {versionDiff.comparedCount}</div>
                    </div>
                  )}
                  {versionPage && selectedPage && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded border border-border-subtle p-2">
                        <div className="mb-1 font-medium text-text-primary">Current</div>
                        <div className="space-y-1 text-text-secondary">
                          {selectedPage.sections.slice(0, 6).map((section) => (
                            <div key={`cur-${section.id}`} className="truncate">
                              {section.name} · {section.visible ? "Visible" : "Hidden"}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded border border-border-subtle p-2">
                        <div className="mb-1 font-medium text-text-primary">Selected Version</div>
                        <div className="space-y-1 text-text-secondary">
                          {versionPage.sections.slice(0, 6).map((section) => (
                            <div key={`ver-${section.id}`} className="truncate">
                              {section.name} · {section.visible ? "Visible" : "Hidden"}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => compareVersionId && restoreVersion(compareVersionId)}
                    disabled={!compareVersionId}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore selected version
                  </Button>
                </div>
                <div className="rounded border border-border-subtle px-3 py-2">
                  <div className="mb-2 font-medium text-text-primary">Approval queue</div>
                  {!canApprove && (
                    <div className="mb-2 text-[11px] text-text-secondary">
                      You can request approvals. Only manager/admin roles can approve/reject.
                    </div>
                  )}
                  <div className="space-y-2">
                    {approvalsData.slice(0, 4).map((item) => (
                      <div key={item.id} className="rounded border border-border-subtle p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-text-primary">{item.pageName}</span>
                          <StatusBadge
                            tone={
                              item.status === "Approved"
                                ? "success"
                                : item.status === "Rejected"
                                  ? "error"
                                  : "warning"
                            }
                          >
                            {item.status}
                          </StatusBadge>
                        </div>
                        <div className="mt-1 text-[11px] text-text-secondary">
                          {item.requestedBy} · {item.requestedAt}
                        </div>
                        {item.status === "Pending" && (
                          <div className="mt-2 flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => decideApproval(item.id, "Approved")}
                              disabled={!canApprove}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => decideApproval(item.id, "Rejected")}
                              disabled={!canApprove}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded border border-border-subtle px-3 py-2">
                  <div className="mb-1 font-medium text-text-primary">Approval audit timeline</div>
                  <div className="space-y-2 text-[11px] text-text-secondary">
                    {approvalsData.slice(0, 6).map((item) => (
                      <div
                        key={`audit-${item.id}`}
                        className="rounded border border-border-subtle p-2"
                      >
                        <div className="font-medium text-text-primary">{item.pageName}</div>
                        <div>
                          Request by {item.requestedBy} at {item.requestedAt}
                        </div>
                        <div>
                          Decision: {item.status}
                          {item.approver ? ` by ${item.approver}` : ""}
                          {item.decidedAt ? ` at ${item.decidedAt}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded border border-border-subtle px-3 py-2">
                  <div className="font-medium text-text-primary">Last publish</div>
                  <div className="text-text-secondary">
                    {latestPublish
                      ? `${latestPublish.publishedAt} by ${latestPublish.publishedBy}`
                      : "No publish history"}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebsiteBuilderFeature;
