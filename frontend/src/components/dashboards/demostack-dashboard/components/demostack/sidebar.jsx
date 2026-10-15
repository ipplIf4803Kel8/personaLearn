'use client'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { adminNavigation, currentAdmin } from '../../data'
import { PersonaLearnLogo } from './logo'
import { DashboardLink, useDashboardNavigation } from './navigation'
import { useTheme } from './theme-provider'

function DashboardSidebar() {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useDashboardNavigation()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="demostack-dashboard border-none p-1.5">
      <SidebarHeader className="p-0">
        <div className="flex items-center justify-between rounded-2xl border p-3 pt-3.5 group-data-[collapsible=icon]:p-2.5!">
          <PersonaLearnLogo className="h-6 w-auto group-data-[collapsible=icon]:hidden" />
          <SidebarTrigger className="size-10! [&_svg]:size-5! group-data-[collapsible=icon]:size-12!" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2.75 pt-6 pb-3 group-data-[collapsible=icon]:overflow-x-hidden! group-data-[collapsible=icon]:overflow-y-auto!">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-3 text-sm">Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {adminNavigation.map((item) => {
                const active =
                  item.href === '/admin'
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="h-auto [&_svg]:size-5 group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:gap-0! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span]:hidden"
                    >
                      <DashboardLink
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className="flex items-center gap-2.5 rounded-xl border border-transparent p-3 text-muted-foreground aria-[current=page]:border-border aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-foreground"
                        onClick={() => {
                          if (isMobile) setOpenMobile(false)
                        }}
                      >
                        <item.icon className="size-5" />
                        <span className="text-base">{item.name}</span>
                      </DashboardLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0">
        <div className="p-3 group-data-[collapsible=icon]:p-2.5!">
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className="flex w-full items-center gap-2 border-none text-left outline-none group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
            >
              <Avatar className="size-10 after:border-[2.5px] after:border-border/50">
                <AvatarImage src={currentAdmin.avatar} alt={currentAdmin.name} />
                <AvatarFallback>{currentAdmin.initials}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="truncate font-medium text-foreground">{currentAdmin.name}</p>
                <p className="truncate text-sm text-muted-foreground">{currentAdmin.email}</p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <p className="font-medium text-foreground">{currentAdmin.name}</p>
                  <p className="text-xs text-muted-foreground">{currentAdmin.email}</p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User />
                Pengaturan Akun
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'dark' ? <Sun /> : <Moon />}
                {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOut />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export { DashboardSidebar }
