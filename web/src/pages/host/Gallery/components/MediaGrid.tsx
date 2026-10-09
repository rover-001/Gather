import { useState } from 'react';
import { Check, Eye, Trash2, Video, Globe, Users, Lock, Folder, FolderOpen, ChevronDown } from 'lucide-react';

export interface HostMediaItem {
  id: string;
  eventId: string;
  guestId: string;
  kind: 'photo' | 'video';
  path: string;
  thumbPath: string | null;
  sizeBytes: number;
  visibility: 'host' | 'selected' | 'all';
  createdAt: string;
  uploaderName: string;
  sharedGuestIds: string[];
  sharedGuestNames: string[];
}

interface MediaGridProps {
  items: HostMediaItem[];
  selectedIds: string[];
  groupByFolder?: boolean;
  onToggleSelect: (id: string) => void;
  onPreview: (item: HostMediaItem) => void;
  onDeleteOne: (id: string) => void;
  onDeleteFolder?: (guestId: string, folderName: string, count: number) => void;
}

export function MediaGrid({
  items,
  selectedIds,
  groupByFolder = false,
  onToggleSelect,
  onPreview,
  onDeleteOne,
  onDeleteFolder,
}: MediaGridProps) {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Globe className="w-6 h-6" />
        </div>
        <h4 className="font-serif text-lg font-bold text-slate-900 mb-1">No media yet</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Photos and videos captured by guests will automatically appear here in real-time.
        </p>
      </div>
    );
  }

  // Render a single media item card
  const renderItemCard = (item: HostMediaItem) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <div
        key={item.id}
        className={`group relative rounded-2xl overflow-hidden bg-slate-100 border transition-all ${
          isSelected
            ? 'ring-2 ring-brand-600 border-brand-600 shadow-md'
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        {/* Aspect ratio box */}
        <div className="aspect-square relative w-full bg-slate-200 overflow-hidden">
          {item.kind === 'photo' ? (
            <img
              src={item.thumbPath || item.path}
              alt={`Photo by ${item.uploaderName}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white relative">
              {item.thumbPath && !item.thumbPath.endsWith('.mp4') && !item.thumbPath.endsWith('.webm') && !item.thumbPath.endsWith('.mov') ? (
                <img
                  src={item.thumbPath}
                  alt={`Video by ${item.uploaderName}`}
                  className="w-full h-full object-cover opacity-85"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.path}
                  className="w-full h-full object-cover opacity-80"
                  muted
                  preload="metadata"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
                <Video className="w-7 h-7 text-white drop-shadow-md" />
              </div>
            </div>
          )}

          {/* Selection Checkbox (Elevated above hover overlay with clear hit area) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelect(item.id);
            }}
            className={`absolute top-2 left-2 z-30 w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer shadow-xs ${
              isSelected
                ? 'bg-brand-600 text-white ring-2 ring-white/80'
                : 'bg-white/90 hover:bg-white text-slate-400 hover:text-slate-900 backdrop-blur-xs border border-black/10'
            }`}
            title={isSelected ? 'Deselect item' : 'Select item'}
          >
            <Check className={`w-4 h-4 stroke-[3] ${isSelected ? 'text-white' : 'opacity-40 hover:opacity-100'}`} />
          </button>

          {/* Visibility badge */}
          <div className="absolute top-2 right-2 z-30 pointer-events-none">
            {item.visibility === 'all' && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold flex items-center space-x-1 shadow-xs backdrop-blur-xs">
                <Globe className="w-2.5 h-2.5" />
                <span>All</span>
              </span>
            )}
            {item.visibility === 'selected' && (
              <span className="px-1.5 py-0.5 rounded-md bg-sky-600/90 text-white text-[10px] font-bold flex items-center space-x-1 shadow-xs backdrop-blur-xs">
                <Users className="w-2.5 h-2.5" />
                <span>{item.sharedGuestIds.length}</span>
              </span>
            )}
            {item.visibility === 'host' && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-900/80 text-slate-300 text-[10px] font-bold flex items-center space-x-1 shadow-xs backdrop-blur-xs">
                <Lock className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          {/* Hover actions overlay (z-20, centered below top badges) */}
          <div
            onClick={() => onPreview(item)}
            className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 z-20 cursor-pointer"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(item);
              }}
              className="p-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 shadow-md cursor-pointer transition active:scale-95"
              title="View full resolution"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteOne(item.id);
              }}
              className="p-2.5 rounded-xl bg-white/95 hover:bg-red-50 text-red-600 shadow-md cursor-pointer transition active:scale-95"
              title="Delete media"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom meta bar */}
        <div className="p-2 bg-white flex items-center justify-between text-[11px] border-t border-slate-100">
          <span className="font-semibold text-slate-800 truncate" title={item.uploaderName}>
            {item.uploaderName}
          </span>
          <span className="text-slate-400 text-[10px] shrink-0 font-mono">
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  };

  // If Folder grouping is enabled, render File Manager layout:
  // Folders row on top (collapsed by default), click to open folder view with breadcrumbs
  if (groupByFolder) {
    const foldersMap = new Map<string, { guestId: string; uploaderName: string; items: HostMediaItem[] }>();

    for (const item of items) {
      const key = item.guestId || 'unknown';
      if (!foldersMap.has(key)) {
        foldersMap.set(key, {
          guestId: item.guestId,
          uploaderName: item.uploaderName || 'Unknown Guest',
          items: [],
        });
      }
      foldersMap.get(key)!.items.push(item);
    }

    const folderList = Array.from(foldersMap.values());
    const activeFolder = folderList.find((f) => f.guestId === activeFolderId);

    return (
      <div className="space-y-6">
        {/* File Manager Folder Row */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
              <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Folders ({folderList.length})
              </h3>
            </div>
            {activeFolderId && (
              <button
                type="button"
                onClick={() => setActiveFolderId(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
              >
                <span>View all folders</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {folderList.map((folder) => {
              const isOpen = activeFolderId === folder.guestId;
              const folderItemIds = folder.items.map((i) => i.id);
              const allInFolderSelected = folderItemIds.length > 0 && folderItemIds.every((id) => selectedIds.includes(id));

              return (
                <div
                  key={folder.guestId}
                  onClick={() => setActiveFolderId(isOpen ? null : folder.guestId)}
                  className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isOpen
                      ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/80 border border-amber-200/80 flex items-center justify-center text-amber-600 transition group-hover:scale-105">
                      {isOpen ? (
                        <FolderOpen className="w-5 h-5 fill-amber-500/30" />
                      ) : (
                        <Folder className="w-5 h-5 fill-amber-500/20" />
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {onDeleteFolder && folder.items.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFolder(folder.guestId, folder.uploaderName, folder.items.length);
                          }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition border bg-white/80 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                          title={`Delete entire ${folder.uploaderName}'s folder`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (allInFolderSelected) {
                            for (const id of folderItemIds) {
                              if (selectedIds.includes(id)) onToggleSelect(id);
                            }
                          } else {
                            for (const id of folderItemIds) {
                              if (!selectedIds.includes(id)) onToggleSelect(id);
                            }
                          }
                        }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                          allInFolderSelected
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'bg-white/80 border-slate-200 text-transparent hover:text-slate-400'
                        }`}
                        title={allInFolderSelected ? 'Deselect entire folder' : 'Select entire folder'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-xs text-slate-900 truncate" title={folder.uploaderName}>
                      {folder.uploaderName}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center justify-between">
                      <span>{folder.items.length} {folder.items.length === 1 ? 'file' : 'files'}</span>
                      <span className="text-[10px] text-amber-600 font-semibold">
                        {isOpen ? 'Open' : 'Tap to open'}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Folder Contents Inspector */}
        {activeFolder ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Breadcrumb Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveFolderId(null)}
                  className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Gallery
                </button>
                <span className="text-slate-300">/</span>
                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                  <FolderOpen className="w-4 h-4 text-amber-500 fill-amber-500/30" />
                  <span>{activeFolder.uploaderName}&apos;s Folder</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ml-1">
                  {activeFolder.items.length} items
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {onDeleteFolder && activeFolder.items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteFolder(activeFolder.guestId, activeFolder.uploaderName, activeFolder.items.length);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1 border border-red-200"
                    title="Delete entire folder"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete Folder</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const ids = activeFolder.items.map((i) => i.id);
                    const allSelected = ids.every((id) => selectedIds.includes(id));
                    if (allSelected) {
                      for (const id of ids) if (selectedIds.includes(id)) onToggleSelect(id);
                    } else {
                      for (const id of ids) if (!selectedIds.includes(id)) onToggleSelect(id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  {activeFolder.items.every((i) => selectedIds.includes(i.id))
                    ? 'Deselect folder items'
                    : 'Select all in folder'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFolderId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  title="Close folder view"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Folder Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {activeFolder.items.map(renderItemCard)}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400 shadow-2xs">
              <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            </div>
            <p className="text-xs text-slate-600 font-semibold">Select a folder above to view its images</p>
            <p className="text-[11px] text-slate-400 mt-1">Each guest has their own dedicated folder</p>
          </div>
        )}
      </div>
    );
  }

  // Plain Flat Grid (when groupByFolder is false)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.map(renderItemCard)}
    </div>
  );
}
