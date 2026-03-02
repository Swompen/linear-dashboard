import { Search, LogOut, User, Plus } from "lucide-react";
import Button from "../ui/Button";

export default function Navbar({ user, onSignIn, onSignOut, searchQuery, onSearchChange, isStaff, onAddNew }) {
  return (
    <nav className="sticky top-0 z-40 bg-[#1a1a1f]/80 backdrop-blur-md border-b border-gray-800/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Kristallens "Att-Göra-Lista"
            </h1>
          </div>

          {/* Search Bar */}
          {user && (
            <div className="flex-1 max-w-md mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Sök i titel och beskrivning..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0f0f12] text-gray-100 border border-gray-800/50 focus:border-blue-500 focus:outline-none transition text-sm"
                />
              </div>
            </div>
          )}

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user && isStaff && (
              <Button variant="primary" size="sm" onClick={onAddNew} className="px-4">
                <Plus size={16} className="mr-2" />
                <span className="hidden sm:inline">Lägg till ny</span>
                <span className="sm:hidden">Ny</span>
              </Button>
            )}
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-gray-400 text-sm">
                  <User size={16} />
                  <span className="text-gray-300 font-medium">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={onSignOut}>
                  <LogOut size={16} className="mr-2" />
                  <span className="hidden sm:inline">Logga ut</span>
                </Button>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={onSignIn}>
                Logga in med Discord
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {user && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Sök i titel och beskrivning..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0f0f12] text-gray-100 border border-gray-800/50 focus:border-blue-500 focus:outline-none transition text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
