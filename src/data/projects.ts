export interface Project {
  name: string
  description: string
  longDescription?: string
  image?: string
  url?: string
  github?: string
  tech: string[]
  featured?: boolean
  wip?: boolean
}

export const projects: Project[] = [
  // 在此添加更多项目...
  {
    name: 'Win10/11 台式机显示器屏幕亮度调节程序',
    description: '台式机 Win10/11 如何优雅地调节显示器亮度？ 不到60KB 的小软件即可优雅解决！支持多显示器。',
    github: 'lofiski/win-lightness',
    tech: ['C++'], 
    featured: true,
  },
  {
    name: '不到 80KB 的极简桌面宠物猫',
    description: '极简桌面小宠物计时器。一只程序化小猫在桌面底部溜达，顺便帮你管时间。',
    github: 'lofiski/qtimer',
    tech: ['C++'],
    featured: true,
  },
  {
    // 适合老年人的益智游戏集合，大字体、点击操作，简单易上手。
    name: '适合老年人的益智游戏集合',
    description: '适合老年人的益智游戏集合，大字体、点击操作，简单易上手。',
    github: 'lofiski/omgame',
    tech: ['Dart', 'Kotlin'],
  },
  {
    name:"Flash 网页游戏机",
    description: '流畅游玩',
    github: 'lofiski/swfgame',
    url: 'https://swf.125815.xyz/',
    tech: ['JavaScript'],
  },
  
  {
    name: 'lofiski.github.io',
    description: '本站。极简复古风格的个人博客，Vue 3 + Vite 构建。',
    github: 'lofiski/lofiski.github.io',
    url: 'https://lofiski.github.io',
    tech: ['Vue 3', 'Vite', 'TypeScript'],
    featured: false,
  },
  {
    name: '门窗效果图生成器',
    description: '一款简单的门窗效果图生成工具，支持自定义尺寸和材质。',
    url: 'https://mc.125815.xyz/',
    tech: ['JS'],  
  }
  
  
]
