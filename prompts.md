# 1
开发一款中文博客,页面有:
首页(展示个人信息)/博客/项目(展示我的项目信息,如图片/功能/url,导航到github与网页等,)照片(展示我拍的照片)/联系图标(放在右上角,如github,x.com,email)/RSS功能/切换亮暗,默认暗

要求:
保持极简风格,复古风格(调用ui-ux-pro-max,front-design等),首页展示信息,不要首页一大段空白.


技术栈要求:
保持架构的优良,方便扩展代码.

Vue3 技术栈及其最佳实践.使用@shikijs/markdown-it对markdown有一个比较好的支持.


具体细节:
~/posts目录下是反我直接写的markdown文章的.展示代码,可以在调用vue3组件等,开箱即用.
~/photos放我的照片,照片放入后,每次提交代码会运行脚本自动去除照片的各种敏感信息,如exif等,保留照片的拍摄时间的(我不是很清楚照片的时间机制,如上面create time/update time,放在取这些时间中最早的就对了,确保git add /git commit不会意外泄露我的照片,这其中的机制你自己把握)
photos:可以参考这些代码
```
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { encode as blurhashEncode } from 'blurhash'
import ExifReader from 'exifreader'
import fg from 'fast-glob'
import { basename, join, parse } from 'pathe'
import sharp from 'sharp'
import { compressSharp } from './img-compress'

const folder = fileURLToPath(new URL('../photos', import.meta.url))

let files = (await fg('**/*.{jpg,png,jpeg}', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: fileURLToPath(new URL('../photos', import.meta.url)),
}))
  .sort((a, b) => a.localeCompare(b))

// Compress photos
for (const filepath of files) {
  if (basename(filepath).startsWith('p-')) {
    continue
  }
  let writepath = filepath
  let { ext } = parse(filepath.toLowerCase())
  if (ext === '.jpeg')
    ext = '.jpg'
  const buffer = await fs.readFile(filepath)
  const img = await sharp(buffer)
  const exif = await ExifReader.load(buffer)

  let title: string | undefined

  let dateRaw = exif.DateTimeOriginal?.value || exif.DateTime?.value || exif.DateCreated?.value
  dateRaw ||= new Date(await fs.stat(filepath).then(stat => stat.birthtime || stat.mtime)).toISOString()
  if (Array.isArray(dateRaw))
    dateRaw = dateRaw[0] as string
  dateRaw = String(dateRaw)

  // convert 2025:02:02 10:07:10 to date object
  let date = new Date(dateRaw.replace(/:/g, (x, idx) => {
    if (idx < 10)
      return '-'
    return x
  }))
  if (Number.isNaN(+date)) {
    date = new Date()
  }

  const timeDiff = Date.now() - +date
  // 1 hour
  if (timeDiff < 1000 * 60 * 60) {
    console.warn(`Date of ${filepath} is too recent: ${dateRaw}`)
    continue
  }

  const base = `p-${date.toISOString().replace(/[:.a-z]+/gi, '-')}`
  let index = 1
  while (existsSync(join(folder, `${base}${index}${ext}`.toLowerCase())))
    index++
  writepath = join(folder, `${base}${index}${ext}`.toLowerCase())

  const { outBuffer, percent, outFile } = await compressSharp(img, buffer, filepath, writepath)
  if (outFile !== filepath || percent > -0.10)
    await fs.writeFile(outFile, outBuffer)
  if (outFile !== filepath)
    await fs.unlink(filepath)

  if (title) {
    await fs.writeFile(outFile.replace(/\.\w+$/, '.json'), JSON.stringify({ text: title }, null, 2))
  }
}

// Generate blurhash
files = (await fg('**/*.{jpg,png,jpeg}', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: fileURLToPath(new URL('../photos', import.meta.url)),
}))
  .sort((a, b) => a.localeCompare(b))

for (const filepath of files) {
  if (!basename(filepath).startsWith('p-')) {
    continue
  }
  const configFile = filepath.replace(/\.\w+$/, '.json')
  let config: Record<string, any> = {}
  if (existsSync(configFile)) {
    config = JSON.parse(await fs.readFile(configFile, 'utf-8'))
  }
  if (config.blurhash) {
    continue
  }
  const buffer = await fs.readFile(filepath)
  const img = sharp(buffer)
  const { data, info } = await img
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'cover' })
    .toBuffer({ resolveWithObject: true })
  const blurhash = blurhashEncode(new Uint8ClampedArray(data), info?.width, info?.height, 4, 4)
  config.blurhash = blurhash
  await fs.writeFile(configFile, JSON.stringify(config, null, 2))
}

// Clean up json files that don't have a corresponding image
for (const json of await fg('**/*.json', {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: fileURLToPath(new URL('../photos', import.meta.url)),
})) {
  if (!existsSync(json.replace(/\.json$/, '.jpg')))
    await fs.unlink(json)
}
```
```
"photos": "tsx scripts/photos-manage.ts",
```
不一定要照搬照抄,你自己合理设计,放在好用就行,开箱即用



# 2
/vue-best-practices 应该准寻vue的最佳实践.写好github action,每次push commit自动更新.写netlify的配置文件.


# 3 
❯ posts页面的搜索要支持全文检索;markdown中使用,vue组件似乎是失效的,如图;在亮色主题,代码的高亮显示有问题,看起来代码全是
  黑色的;照片要按时间排序展示,最新的放最前面;rss功能无效,点进去一直在加载.



# 4
 1. 在markdown博客或者某些vue3组件，我可能需要引用图片。有两种图片，一是会在照片页展示的照片。另一部分不是，这部分就建
立个imgs文件夹，这部分也和照片一样需要去除exif等详细，用脚本进行处理。这两种照片都要能够方便引用。还有一个逻辑上，如果
项目下有这两种照片有没有处理的，都不能commit。把引用照片的方法写入readme，引用方法一定要足够简单，符合直觉。

2. 主页展示最近文章的标题，以及博客页面的标题不应该是文件名啊，而应该展示md文件里的title元数据啊。

3. 博客页面还是不支持标题过滤啊，也就是在搜索框下面展示所有用到的标签，点击即可过滤，也可以取消过滤器。与搜索框是协同共
同作用的。

4. <DOMAIN>/#/blog， 这个#号也太丑了，换一种没有#号的路由模式啊。
调用frontend-design vue-best-practices vue等skill

# 5
 /frontend-design 创建一个留言板页面，与网页保持一致的视觉风格。
  使用supabase的数据库，调用其mcp

  具体功能：
  1. 使用留言板无需登陆注册，要留言的人输入"昵称："和"留言内容："即可留言。注意不要被sql注入攻
  击等。
  2. 为了防止被滥用，每个ip一天最多留言3条。
  3. 所有人都可以查看全部留言板，但是为了避免大量的数据库申请，留言是懒加载的。

  具体如何设计数据结构等，你自己想把。

  我想留言人的ip是要存入数据库的，省的被攻击。