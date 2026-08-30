"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SidebarSpacesIcon } from "@/components/icons/SidebarIcons";
import { mockAccessibleSpaces } from "@/mocks/spaces.mock";
import type { Space } from "@/types/spaces";

type WorkspaceSpacesNavProps = {
  onNavigate?: () => void;
  onExpand?: () => void;
  collapsed?: boolean;
  mobile?: boolean;
};

const spaceById = new Map(
  mockAccessibleSpaces.map((space) => [space.id, space]),
);

function getSpaceDepth(space: Space) {
  let depth = 0;
  let currentSpace = space;

  while (currentSpace.parent_space_id) {
    const parentSpace = spaceById.get(currentSpace.parent_space_id);

    if (!parentSpace) {
      break;
    }

    depth += 1;
    currentSpace = parentSpace;
  }

  return depth;
}

function buildSpaceTree(spaces: Space[]) {
  const childrenByParent = new Map<string, Space[]>();

  spaces.forEach((space) => {
    if (!space.parent_space_id) {
      return;
    }

    const siblings = childrenByParent.get(space.parent_space_id) ?? [];
    siblings.push(space);
    childrenByParent.set(space.parent_space_id, siblings);
  });

  const roots = spaces.filter((space) => !space.parent_space_id);

  return {
    roots,
    childrenByParent,
  };
}

export function WorkspaceSpacesNav({
  onNavigate,
  onExpand,
  collapsed = false,
  mobile = false,
}: WorkspaceSpacesNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { roots, childrenByParent } = useMemo(
    () => buildSpaceTree(mockAccessibleSpaces),
    [],
  );

  return (
    <section
      className={
        mobile
          ? "border-t border-[#e6ecf2] px-5 py-5"
          : "border-t border-[#e6ecf2] px-4 py-4"
      }
    >
      {collapsed ? (
        <button
          type="button"
          aria-label="Espacios"
          title="Espacios"
          onClick={onExpand}
          className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl text-[#526173] transition hover:bg-[#F1F4F7] hover:text-[#152436]"
        >
          <SidebarSpacesIcon className="h-5 w-5" />
        </button>
      ) : (
        <>
          <button
            type="button"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
            className={
              mobile
                ? "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white"
                : "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-white"
            }
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#526173]">
              Espacios
            </span>

            <span
              className={`ml-3 shrink-0 text-sm font-semibold text-[#526173] transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </button>

          {isOpen && (
            <div className={mobile ? "mt-4 space-y-4" : "mt-4 space-y-3"}>
              {roots.map((space) => {
                const children = childrenByParent.get(space.id) ?? [];

                return (
                  <div key={space.id} className="space-y-1">
                    <Link
                      href={`/documents?space=${space.id}`}
                      onClick={onNavigate}
                      className={
                        mobile
                          ? "flex min-h-12 items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium text-[#152436] transition hover:bg-white"
                          : "flex min-h-10 items-center justify-between rounded-xl px-3 py-2.5 text-[14px] font-medium text-[#152436] transition hover:bg-white"
                      }
                    >
                      <span className="truncate">{space.name}</span>

                      {children.length > 0 && (
                        <span className="ml-3 text-xs font-semibold text-[#637083]">
                          {children.length}
                        </span>
                      )}
                    </Link>

                    {children.length > 0 && (
                      <div className={mobile ? "ml-4 space-y-1 border-l border-[#e6ecf2] pl-4" : "ml-3 space-y-1 border-l border-[#e6ecf2] pl-3"}>
                        {children.map((child) => {
                          const grandChildren =
                            childrenByParent.get(child.id) ?? [];

                          return (
                            <div key={child.id} className="space-y-1">
                              <Link
                                href={`/documents?space=${child.id}`}
                                onClick={onNavigate}
                                className={
                                  mobile
                                    ? "flex min-h-11 items-center rounded-lg px-3 py-2.5 text-[14px] font-medium text-[#526173] transition hover:bg-white hover:text-[#152436]"
                                    : "flex min-h-9 items-center rounded-lg px-3 py-2 text-[13px] font-medium text-[#526173] transition hover:bg-white hover:text-[#152436]"
                                }
                                style={{
                                  paddingLeft: mobile
                                    ? `${0.9 + getSpaceDepth(child) * 0.35}rem`
                                    : `${0.75 + getSpaceDepth(child) * 0.4}rem`,
                                }}
                              >
                                <span className="truncate">{child.name}</span>
                              </Link>

                              {grandChildren.length > 0 && (
                                <div className={mobile ? "ml-4 space-y-1 border-l border-[#e6ecf2] pl-4" : "ml-3 space-y-1 border-l border-[#e6ecf2] pl-3"}>
                                  {grandChildren.map((grandChild) => (
                                    <Link
                                      key={grandChild.id}
                                      href={`/documents?space=${grandChild.id}`}
                                      onClick={onNavigate}
                                      className={
                                        mobile
                                          ? "flex min-h-11 items-center rounded-lg px-3 py-2.5 text-[14px] font-medium text-[#637083] transition hover:bg-white hover:text-[#152436]"
                                          : "flex min-h-9 items-center rounded-lg px-3 py-2 text-[13px] font-medium text-[#637083] transition hover:bg-white hover:text-[#152436]"
                                      }
                                      style={{
                                        paddingLeft: mobile
                                          ? `${1.15 + getSpaceDepth(grandChild) * 0.3}rem`
                                          : `${1.05 + getSpaceDepth(grandChild) * 0.35}rem`,
                                      }}
                                    >
                                      <span className="truncate">
                                        {grandChild.name}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isOpen && (
            <Link
              href="/documents"
              onClick={onNavigate}
              className={
                mobile
                  ? "mt-4 inline-flex px-3 text-sm font-semibold text-brand transition hover:text-brand-hover"
                  : "mt-4 inline-flex px-3 text-sm font-semibold text-brand transition hover:text-brand-hover"
              }
            >
              Ver todos los espacios
            </Link>
          )}
        </>
      )}
    </section>
  );
}
