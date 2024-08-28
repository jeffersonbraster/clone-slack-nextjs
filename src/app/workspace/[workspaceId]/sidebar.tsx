import UserButtom from "@/features/auth/components/user-button";
import WorkspaceSwitcher from "./workspace-switcher";
import SidebarButton from "./sidebar-button";
import { Bell, Home, MessagesSquare, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
      <WorkspaceSwitcher />
      <SidebarButton
        icon={Home}
        label="Inicio"
        isActive={pathname.includes("/workspace")}
      />
      <SidebarButton icon={MessagesSquare} label="DMs" />
      <SidebarButton icon={Bell} label="Atividades" />
      <SidebarButton icon={MoreHorizontal} label="Mais" />
      <div className="flex flex-col items-center justify-center gap-y-1 mt-auto">
        <UserButtom />
      </div>
    </aside>
  );
};

export default Sidebar;
