{ pkgs }: {
  deps = [
    pkgs.nodejs_18
    pkgs.chromium
    pkgs.libnss3
    pkgs.libXss1
    pkgs.libappindicator3
    pkgs.libgconf2
  ];
}
