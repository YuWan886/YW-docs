---
title: Packwiz X PrismLauncher的整合包自动更新
tags:
  - 整合包
  - 教程
created: 2025-08-27
updated: 2025-08-27
cover: https://ypy-uss.yuwan886.top/YW-docs/tutorial/packwiz/cover.png
---

# Packwiz X PrismLauncher的整合包自动更新
![我是封面](https://ypy-uss.yuwan886.top/YW-docs/tutorial/packwiz/cover.png)

## 什么是 Packwiz？

Packwiz 是一个使用 Go 语言编写的跨平台 Minecraft 整合包管理工具，旨在简化整合包的创建、发布与更新流程。它支持 Windows、Linux 和 macOS 系统，能够通过声明式文件（TOML 格式）管理 Mod、资源包、配置等资源，并支持从 CurseForge 和 Modrinth 等平台自动获取更新。

Packwiz 的核心功能包括：

- **自动化依赖管理**：自动解析并下载 Mod 及其依赖项。
- **跨平台支持**：可在多种操作系统上运行。
- **与启动器兼容**：支持 PrismLauncher、MultiMC 等主流启动器。
- **轻量高效**：基于 Go 语言编写，启动速度快，资源占用低。

**[Packwiz Template pack](https://github.com/YuWan886/Packwiz-Template-Pack)**：一个 Packwiz 项目模版

## 1. 安装 Packwiz

Packwiz 支持 Windows、Linux 和 macOS。你可以从以下地址下载最新版本：

- [GitHub Actions](https://github.com/packwiz/packwiz/actions)
- [nightly.link](https://nightly.link/packwiz/packwiz/workflows/go/main)

下载对应平台的二进制文件后，将其放入系统 PATH 或项目目录中即可使用。

## 2. 初始化整合包

在项目根目录打开终端（cmd/PowerShell/bash），运行以下命令：

```cmd
packwiz init
```
![packwiz-init.png](https://ypy-uss.yuwan886.top/YW-docs/tutorial/packwiz/packwiz-init.png)

根据提示依次输入：

- 整合包名称
- 作者
- 版本号
- Minecraft 版本
- Mod 加载器（如 Fabric、Forge）
- 加载器版本

完成后会生成两个文件：

- `pack.toml`：整合包的定义文件，格式见[官方文档](https://packwiz.infra.link/reference/pack-format/pack-toml/)。
- `index.toml`：资源索引文件，格式见[官方文档](https://packwiz.infra.link/reference/pack-format/index-toml/)。

## 3. 添加资源

### 直接复制文件

如 `config`、`scripts` 等文件夹中的内容，直接复制到项目对应目录即可。

### 使用 `.pw.toml` 文件管理

PrismLauncher 使用 `.pw.toml` 文件管理 Mod 更新。你先将 `.index` 文件夹中的文件复制到 Packwiz 项目的 `mods/` 文件夹中，并稍作修改即可使用。  

格式见[官方文档](https://packwiz.infra.link/reference/pack-format/index-toml/)

### 示例文件

#### Mod（Modrinth）

```toml
filename = 'sodium-fabric-0.6.13+mc1.21.6.jar'
name = 'Sodium'
side = 'client'  # 可选：both, client, server 客户端更新的话也可以选both

[download]
hash = 'ee97e3df07a6f734bc8a0f77c1f1de7f47bed09cf682f048ceb12675c51b70ba727b11fcacbb7b10cc9f79b283dd71a39751312b5c70568aa3ac9471407174db'
hash-format = 'sha512' # 可选：sha256, sha512, sha1, md5, murmur2
mode = 'url'
url = 'https://cdn.modrinth.com/data/AANobbMI/versions/ND4ROcMQ/sodium-fabric-0.6.13%2Bmc1.21.6.jar'

[update.modrinth] # 可选，不填就没有不会去更新
mod-id = 'AANobbMI'
version = 'ND4ROcMQ'
```

#### Mod（CurseForge）

```toml
filename = 'Controlling-fabric-1.21.8-26.0.3.jar'
name = 'Controlling'
side = 'client'

[download]
hash = 'f07bf0fe10c6c72be971c489547558de005cf597'
hash-format = 'sha1'
mode = 'metadata:curseforge'

[update.curseforge]
file-id = 6898845
project-id = 250398
```

#### 资源包（Modrinth）

```toml
filename = 'Bare Bones 1.21.7.zip'
name = 'Bare Bones'
side = 'client'

[download]
hash = '9352d872552f7b6b60f48318322763273c244041e9894ea4dcf76fd84ccc1d29d369dc5237733fefe721fdf49af6030165c5df77d273cb06fe7ecf3555fbae58'
hash-format = 'sha512'
mode = 'url'
url = 'https://cdn.modrinth.com/data/rox3U8B6/versions/sZROMthE/Bare%20Bones%201.21.7.zip'

[update.modrinth]
mod-id = 'rox3U8B6'
version = 'sZROMthE'
```

#### 资源包（CurseForge）

```toml
filename = 'FreshAnimations_v1.10.zip'
name = 'Fresh Animations'
side = 'client'

[download]
hash = 'e89d70039245a248d702189dbf6d1b7aedcee638'
hash-format = 'sha1'
mode = 'metadata:curseforge'

[update.curseforge]
file-id = 6892592
project-id = 453763
```

#### 枪包（CurseForge）

```toml
filename = "cod_warzone_gun_116a.zip"
name = "[TACZ1.1.5+]Call of Duty Warzone Ver1.1.6A"
side = "both"

[download]
hash-format = "sha1"
hash = "bf9600fb2f458feb9c1cf55ab34563a1cd662df3"
mode = "metadata:curseforge"

[update.curseforge]
file-id = 6882523
project-id = 1196617
```

## 4. 常用命令

以下是一些在管理 Packwiz 整合包时常用的命令，方便快速操作和维护整合包。这些命令可以帮助你更高效地创建、更新和导出整合包。

- **`packwiz init`**  
  初始化一个新的整合包，生成 `pack.toml` 和 `index.toml` 文件，用于定义整合包的基本信息和资源索引。

- **`packwiz refresh`**  
  更新整合包的 `index.toml` 文件，重新扫描项目目录中的文件并更新其哈希值，以确保索引与实际文件一致。每次手动添加、删除或编辑文件后都需要运行此命令。

- **`packwiz update -a`**  
  更新所有 `.pw.toml` 文件（依赖于 [update]）

- **`packwiz curseforge install [mod]`**  
  从 CurseForge 安装指定的 Mod 到整合包中，自动生成对应的 `.pw.toml` 文件。

- **`packwiz modrinth install [mod]`**  
  从 Modrinth 安装指定的 Mod 到整合包中，自动生成对应的 `.pw.toml` 文件。

- **`packwiz update [mod]`**  
  更新指定 Mod 到最新版本，自动从 CurseForge 或 Modrinth 下载最新文件。

- **`packwiz update --all`**  
  更新整合包中的所有 Mod 到最新版本，简化批量更新流程。

- **`packwiz curseforge export`**  
  导出整合包为 CurseForge 启动器支持的格式，生成一个 `.zip` 文件。

- **`packwiz modrinth export`**  
  导出整合包为 Modrinth 支持的格式，生成一个 `.mrpack` 文件，适用于 Modrinth 平台或其启动器。

- **`packwiz curseforge detect`**  
  扫描整合包中的文件，检测哪些文件可在 CurseForge 上找到，并将其配置为从 CurseForge 下载。

- **`packwiz curseforge import [zip path]`**  
  导入现有的 CurseForge 整合包（.zip 文件），将所有 Mod 和文件导入当前目录。请确保你有权限重新分发导入的整合包。

使用 `--help` 标志可以获取每个命令的详细说明，例如 `packwiz init --help`。

## 5. 使用 `packwiz-installer` 进行自动更新

下载 [packwiz-installer](https://github.com/packwiz/packwiz-installer/releases/latest) 和 [packwiz-installer-bootstrap](https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest)，放到客户端版本文件夹的根目录下，即和 `option.txt` 在同一个目录。

你可以使用 `packwiz server` 启动一个本地服务器，提供整合包更新服务。

```bash
packwiz server
```

默认端口为 `8080`。若端口被占用，可指定其他端口：

```bash
packwiz server -p 9000
```

- 在 `PrismLauncher` 以及 `HMCL` 中，设置预启动命令如下：

```bash
"$INST_JAVA" -jar packwiz-installer-bootstrap.jar http://localhost:8080/pack.toml
```
![prismlauncher.png](https://ypy-uss.yuwan886.top/YW-docs/tutorial/packwiz/prismlauncher.png)

![hmcl.png](https://ypy-uss.yuwan886.top/YW-docs/tutorial/packwiz/hmcl.png)

- 在 `PCL2` 中则是：

```cmd
cd "{verpath}" && java -jar packwiz-installer-bootstrap.jar http://localhost:8080/pack.toml
```
![pcl2.png](https://ypy-uss.yuwan886.top/YW-docs/tutorial/packwiz/pcl2.png)

启动游戏前会自动更新所有资源。

## 6. 其他功能与提示

### 忽略文件：`.packwizignore`

类似于 `.gitignore`，用于排除不需要由 Packwiz 管理的文件。

### 查找 CurseForge 的 `project-id` 和 `file-id`

在 CurseForge 项目页面的 URL 或文件下载区域可以找到这些信息：

![curseforge.png](https://ypy-uss.yuwan886.top/YW-docs/tutorial/packwiz/curseforge.png)

### 查找 Modrinth 的 `mod-id` 和 `version`

在 Modrinth 项目页面的 URL 或版本列表中可以找到这些信息：

![modrinth.png](https://ypy-uss.yuwan886.top/YW-docs/tutorial/packwiz/modrinth.png)

## 7. 常见问题

### Q: 端口被占用怎么办？
A: 使用 `packwiz server -p <端口号>` 指定其他端口。

### Q: 如何更新所有内容？
A: 先运行 `packwiz update -a`，这会自动更新具有 **[update]** 的 `.pw.toml` 文件，然后运行 `packwiz refresh`。

### Q: 是否支持非 CurseForge/Modrinth 的资源？
A: 支持，可使用 `mode = "url"` 并手动指定下载链接和哈希值。

---

如果有更多问题，请参考 [Packwiz 官方文档](https://packwiz.infra.link/)