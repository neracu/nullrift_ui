'use client';

import Link from 'next/link';
import {
  Download,
  FolderOpen,
  HelpCircle,
  Home,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  BUILDER_HELP_HREF,
  BUILDER_HOME_HREF,
  BUILDER_LABELS,
} from '@/lib/builder-nav';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatShortcut } from '@/hooks/use-keyboard-shortcuts';

export interface BuilderSidebarActions {
  onWorkspace: () => void;
  onExport: () => void;
  onLibrary: () => void;
  onSettings: () => void;
}

interface SidebarProps extends BuilderSidebarActions {
  className?: string;
}

const tipWorkspace = formatShortcut({ key: 'k', ctrl: true });
const tipExport = formatShortcut({ key: 'e', ctrl: true });

const navIconClass = 'size-5 shrink-0 stroke-[1.5]';
const navGroupIconModeClass = '';
const navMenuIconModeClass = 'w-full min-w-0';
const navItemIconModeClass = 'w-full min-w-0';
const navGroupContentIconModeClass = 'w-full min-w-0';

/**
 * Builder collapsible rail: shadcn Sidebar (icon/offcanvas), nav actions, profile dropdown.
 */
export function Sidebar({
  className,
  onWorkspace,
  onExport,
  onLibrary,
  onSettings,
}: SidebarProps) {
  const run = (fn: () => void) => {
    fn();
  };

  const handleSignOut = () => {
    toast.info('Signed out', { description: 'Auth is not wired yet — returning home.' });
  };

  return (
    <ShadcnSidebar collapsible="icon" variant="sidebar" className={cn('border-sidebar-border', className)}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className={navIconClass} />
          </div>
          <div className="min-w-0 flex-1 leading-tight transition-[opacity,max-width] duration-200 ease-linear motion-reduce:transition-none group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:flex-none">
            <p className="truncate text-base font-semibold">{BUILDER_LABELS.brandTitle}</p>
            <p className="truncate text-sm text-sidebar-foreground/70">{BUILDER_LABELS.brandSubtitle}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className={navGroupIconModeClass}>
          <SidebarGroupLabel>Build</SidebarGroupLabel>
          <SidebarGroupContent className={navGroupContentIconModeClass}>
            <SidebarMenu className={navMenuIconModeClass}>
              <SidebarMenuItem className={navItemIconModeClass}>
                <SidebarMenuButton
                  type="button"
                  onClick={() => run(onWorkspace)}
                  tooltip={{ children: `Workspace (${tipWorkspace})` }}
                >
                  <LayoutDashboard className={navIconClass} />
                  <span>{BUILDER_LABELS.workspace}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className={navItemIconModeClass}>
                <SidebarMenuButton
                  type="button"
                  onClick={() => run(onLibrary)}
                  tooltip="Library"
                >
                  <FolderOpen className={navIconClass} />
                  <span>{BUILDER_LABELS.library}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className={navItemIconModeClass}>
                <SidebarMenuButton
                  type="button"
                  onClick={() => run(onExport)}
                  tooltip={{ children: `Export (${tipExport})` }}
                >
                  <Download className={navIconClass} />
                  <span>{BUILDER_LABELS.export}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu className={navMenuIconModeClass}>
          <SidebarMenuItem className={navItemIconModeClass}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  tooltip="Account"
                >
                  <Avatar className="size-9 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-sidebar-primary text-sm text-sidebar-primary-foreground">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-base leading-tight">
                    <span className="truncate font-semibold">User</span>
                    <span className="truncate text-sm text-sidebar-foreground/70">Free plan</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-medium leading-none">User</p>
                    <p className="text-sm leading-none text-muted-foreground">you@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login" className="cursor-pointer text-base">
                    <User className="mr-2 size-5" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-base"
                  onClick={() => {
                    onSettings();
                  }}
                >
                  <Keyboard className="mr-2 size-5" />
                  {BUILDER_LABELS.settings}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={BUILDER_HELP_HREF} className="cursor-pointer text-base">
                    <HelpCircle className="mr-2 size-5" />
                    {BUILDER_LABELS.help}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={BUILDER_HOME_HREF} className="cursor-pointer text-base">
                    <Home className="mr-2 size-5" />
                    {BUILDER_LABELS.home}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-base text-destructive focus:text-destructive"
                  onClick={() => {
                    handleSignOut();
                  }}
                >
                  <LogOut className="mr-2 size-5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  );
}

// Made with Bob
