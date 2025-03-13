import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, Home, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscordScraper } from './DiscordScraper';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className={cn(
        "glass fixed h-screen transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="flex items-center justify-between p-4">
          <h1 className={cn(
            "font-bold transition-all duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0"
          )}>
            Painel
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-all duration-300",
              !sidebarOpen && "rotate-180"
            )} />
          </Button>
        </div>

        <nav className="space-y-2 p-4">
          {[
            { icon: Home, label: "Início" },
            { icon: Users, label: "Usuários" },
            { icon: Settings, label: "Configurações" },
          ].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                !sidebarOpen && "justify-center"
              )}
            >
              <item.icon className="h-4 w-4 mr-2" />
              <span className={cn(
                "transition-all duration-300",
                sidebarOpen ? "opacity-100" : "opacity-0 w-0"
              )}>
                {item.label}
              </span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className={cn(
        "flex-1 transition-all duration-300 p-6",
        sidebarOpen ? "ml-64" : "ml-20"
      )}>
        <DiscordScraper />
      </main>
    </div>
  );
};
