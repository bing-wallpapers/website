export default {
  title: "Bing Wallpapers",
  description: "Automatic daily collection Bing Wallpapers",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.png" }]],
  themeConfig: {
    nav: [
      { text: 'Github', link: 'https://github.com/bing-wallpapers/website' },
    ],
    footer: {
      message: 'Released under the <a href="https://github.com/vuejs/vitepress/blob/main/LICENSE">MIT License</a>.',
      copyright: 'Copyright © 2022-present <a href="https://github.com/exposir">Expo</a>'
    },
    search: {
      provider: 'local'
    }
  }

}
