import React, { useState } from 'react';
import {
  Check,
  Copy,
  Globe,
  Link2,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createUuid } from '../../engine/prng';
import {
  buildShareUrl,
  generateRandomSlug,
  isSlugAvailable,
  PERMISSION_LABELS,
  ROLE_PRESETS,
  sanitizeVanitySlug,
} from '../../lib/auth-db';
import type {
  CollaboratorEntry,
  CollaboratorPermissions,
  RolePreset,
  ShareMetadata,
  VisibilityLevel,
} from '../../types';

interface SharePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  kind: 'league' | 'sport';
  resourceId: string;
  sharing: ShareMetadata;
  canManageCollaborators: boolean;
  onSave: (nextSharing: ShareMetadata) => void;
}

export const SharePermissionsModal: React.FC<SharePermissionsModalProps> = ({
  isOpen,
  onClose,
  title,
  kind,
  resourceId,
  sharing,
  canManageCollaborators,
  onSave,
}) => {
  const { competitions, allSports, showToast } = useApp();
  const [draft, setDraft] = useState<ShareMetadata>(() => ({
    ...sharing,
    collaborators: sharing.collaborators.map((c) => ({
      ...c,
      permissions: { ...c.permissions },
    })),
  }));

  const [slugInput, setSlugInput] = useState(sharing.slug);
  const [copied, setCopied] = useState(false);

  const [inviteId, setInviteId] = useState('');
  const [inviteType, setInviteType] = useState<CollaboratorEntry['identifierType']>('email');
  const [invitePreset, setInvitePreset] = useState<Exclude<RolePreset, 'custom'>>('sim-operator');

  if (!isOpen) return null;

  const cleanedSlug = sanitizeVanitySlug(slugInput);
  const slugValid =
    cleanedSlug.length >= 3 &&
    (cleanedSlug === sharing.slug ||
      isSlugAvailable(cleanedSlug, competitions, allSports, resourceId));

  const shareUrl = buildShareUrl(kind, slugValid ? cleanedSlug : draft.slug);

  const handleCopyUrl = () => {
    if (canManageCollaborators && slugValid) {
      onSave({ ...draft, slug: cleanedSlug });
    }
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    showToast('Shareable link saved & copied to clipboard');
    setTimeout(() => setCopied(false), 1800);
  };

  const handleGenerateRandomSlug = () => {
    const next = generateRandomSlug(8);
    setSlugInput(next);
    setDraft((d) => ({ ...d, slug: next, isCustomSlug: false }));
  };

  const handleSlugChange = (raw: string) => {
    setSlugInput(raw);
    const clean = sanitizeVanitySlug(raw);
    if (
      clean.length >= 3 &&
      (clean === sharing.slug ||
        isSlugAvailable(clean, competitions, allSports, resourceId))
    ) {
      setDraft((d) => ({ ...d, slug: clean, isCustomSlug: true }));
    }
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    const idClean = inviteId.trim();
    if (!idClean) return;

    if (
      draft.collaborators.some(
        (c) => c.identifier.toLowerCase() === idClean.toLowerCase()
      )
    ) {
      showToast('This collaborator is already invited');
      return;
    }

    const entry: CollaboratorEntry = {
      id: createUuid(),
      identifier: idClean,
      identifierType: inviteType,
      status: 'pending',
      rolePreset: invitePreset,
      permissions: { ...ROLE_PRESETS[invitePreset] },
      invitedAt: new Date().toISOString(),
    };
    setDraft((d) => ({ ...d, collaborators: [...d.collaborators, entry] }));
    setInviteId('');
    showToast(`Added collaborator ${idClean}`);
  };

  const handlePresetChange = (
    collabId: string,
    preset: Exclude<RolePreset, 'custom'>
  ) => {
    setDraft((d) => ({
      ...d,
      collaborators: d.collaborators.map((c) =>
        c.id === collabId
          ? { ...c, rolePreset: preset, permissions: { ...ROLE_PRESETS[preset] } }
          : c
      ),
    }));
  };

  const handleTogglePermission = (
    collabId: string,
    permKey: keyof CollaboratorPermissions
  ) => {
    setDraft((d) => ({
      ...d,
      collaborators: d.collaborators.map((c) => {
        if (c.id !== collabId) return c;
        const nextPerms = { ...c.permissions, [permKey]: !c.permissions[permKey] };
        return { ...c, rolePreset: 'custom', permissions: nextPerms };
      }),
    }));
  };

  const handleSave = () => {
    if (!slugValid) {
      showToast('Please choose an available slug (3+ characters)');
      return;
    }
    onSave({ ...draft, slug: cleanedSlug });
    showToast('Updated share link & collaborator permissions');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-800 bg-[#131b2c] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase">
              <Shield className="h-3.5 w-3.5" />
              Share &amp; Granular Permissions
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white uppercase">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Visibility & Custom/Random Share Link */}
          <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-sky-300 uppercase">
                <Link2 className="h-4 w-4" />
                Visibility &amp; Shareable Link
              </h3>
              <div className="flex gap-1.5">
                {(
                  [
                    { id: 'private' as VisibilityLevel, label: 'Private', icon: Lock },
                    { id: 'unlisted' as VisibilityLevel, label: 'Unlisted', icon: Link2 },
                    { id: 'public' as VisibilityLevel, label: 'Public Hub', icon: Globe },
                  ] as const
                ).map((vis) => {
                  const Icon = vis.icon;
                  const active = draft.visibility === vis.id;
                  return (
                    <button
                      key={vis.id}
                      type="button"
                      disabled={!canManageCollaborators}
                      onClick={() => setDraft((d) => ({ ...d, visibility: vis.id }))}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                        active
                          ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {vis.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-12 items-end text-xs">
              <div className="sm:col-span-5">
                <label className="mb-1 flex items-center justify-between text-slate-400">
                  <span>Custom Vanity Slug</span>
                  <span
                    className={`font-semibold ${
                      slugValid ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {slugValid ? 'Available ✓' : 'Unavailable / <3 chars'}
                  </span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    disabled={!canManageCollaborators}
                    value={slugInput}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="friday-night-premier"
                    className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  />
                  <button
                    type="button"
                    disabled={!canManageCollaborators}
                    onClick={handleGenerateRandomSlug}
                    title="Generate random short slug"
                    className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-sky-300 hover:bg-slate-700 cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="sm:col-span-7">
                <label className="mb-1 block text-slate-400">Shareable URL</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="font-mono-code flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 font-bold text-slate-950 hover:bg-sky-400 cursor-pointer"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Collaborator Invite & Granular Permission Matrix */}
          <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-300 uppercase">
              <Users className="h-4 w-4" />
              Collaborators &amp; Permission Matrix ({draft.collaborators.length})
            </h3>

            {canManageCollaborators && (
              <form
                onSubmit={handleAddCollaborator}
                className="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:grid-cols-12 text-xs items-end"
              >
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-[10px] text-slate-400">Account Type</label>
                  <select
                    value={inviteType}
                    onChange={(e) =>
                      setInviteType(e.target.value as CollaboratorEntry['identifierType'])
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
                  >
                    <option value="email">Email Address</option>
                    <option value="google">Google Account</option>
                    <option value="phone">Phone Number</option>
                    <option value="username">Username</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <label className="mb-1 block text-[10px] text-slate-400">
                    Recipient Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteId}
                    onChange={(e) => setInviteId(e.target.value)}
                    placeholder={
                      inviteType === 'phone'
                        ? '+15551234567'
                        : inviteType === 'username'
                          ? 'coach_alex'
                          : 'friend@example.com'
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-[10px] text-slate-400">Role Preset</label>
                  <select
                    value={invitePreset}
                    onChange={(e) =>
                      setInvitePreset(e.target.value as Exclude<RolePreset, 'custom'>)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="sim-operator">Sim Operator</option>
                    <option value="co-commissioner">Co-Commissioner</option>
                    <option value="full-admin">Full Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Invite
                  </button>
                </div>
              </form>
            )}

            {draft.collaborators.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-5 text-center text-xs text-slate-400">
                No collaborators invited yet. Invite teammates by Email, Google account, Phone, or Username.
              </div>
            ) : (
              <div className="space-y-3">
                {draft.collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase">
                          {collab.identifierType}
                        </span>
                        <span className="font-bold text-white">{collab.identifier}</span>
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300 uppercase">
                          {collab.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          disabled={!canManageCollaborators}
                          value={collab.rolePreset}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'custom') {
                              handlePresetChange(
                                collab.id,
                                val as Exclude<RolePreset, 'custom'>
                              );
                            }
                          }}
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-amber-300"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="sim-operator">Sim Operator</option>
                          <option value="co-commissioner">Co-Commissioner</option>
                          <option value="full-admin">Full Admin</option>
                          {collab.rolePreset === 'custom' && (
                            <option value="custom">Custom Override</option>
                          )}
                        </select>
                        {canManageCollaborators && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                collaborators: d.collaborators.filter(
                                  (c) => c.id !== collab.id
                                ),
                              }))
                            }
                            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {PERMISSION_LABELS.map((perm) => (
                        <label
                          key={perm.key}
                          title={perm.description}
                          className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-950/60 px-2.5 py-1.5 cursor-pointer hover:border-slate-700"
                        >
                          <input
                            type="checkbox"
                            disabled={!canManageCollaborators}
                            checked={collab.permissions[perm.key]}
                            onChange={() => handleTogglePermission(collab.id, perm.key)}
                            className="h-3.5 w-3.5 rounded accent-amber-500"
                          />
                          <span className="truncate text-[11px] text-slate-200">
                            {perm.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          {canManageCollaborators && (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 hidden" />
              Save Share &amp; Permissions
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
