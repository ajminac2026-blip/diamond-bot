{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.chromium
    pkgs.nss
    pkgs.nspr
    pkgs.dbus
    pkgs.libxss
    pkgs.cups
    pkgs.libgconf
    pkgs.libappindicator
    pkgs.libxrender
    pkgs.xorg.libX11
    pkgs.xorg.libxext
    pkgs.xorg.libxfixes
    pkgs.xorg.libxrandr
    pkgs.xorg.libxcb
    pkgs.xorg.libxkbcommon
  ];
}
