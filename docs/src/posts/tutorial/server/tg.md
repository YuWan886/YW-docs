---
title: 糖糕云MC面板服教程
tags:
  - MC
  - 服务器
  - 教程
created: 2025-03-24
updated: 2025-03-24
cover: https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/cover.png
---

# 糖糕云MC面板服教程
---
![我是封面](https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/cover.png)

## 注册与验证
>先注册一个账号[点击注册](https://www.tanggaoyun.com/aff/IZQDEHVK)

点击右上角“免费注册”
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/register_1.png" width = "50%" height = "50%" />
</div>

填入相关信息，完成注册
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/register_2.png" width = "50%" height = "50%" />
</div>

## 购买服务器

点击上方的“支持的游戏”，找到“我的世界”，选择“AMD 5800X 面板服”
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/mcserver_1.png" width = "50%" height = "50%" />
</div>

根据实际情况选择配置，下面是参考。

| CPU/内存 | 带宽  | 适用场景       | 支持人数   | Mod数量  |
| ------ | --- | ---------- | ------ | ------ |
| 2核4G   | 4M  | 纯净服/轻量Mod服 | 10人以内  | ≤20    |
| 4核8G   | 6M  | 中型Mod服/插件服 | 20-30人 | 50-100 |
| 8核16G  | 10M | 大型整合包      | 50人以上  | ≥200   |

对于MC地图来讲，不需要太高的配置，`2核4G`足够用了，糖糕云面板服默认带宽`400Mbps`。
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/mcserver_2.png" width = "50%" height = "50%" />
</div>

## 面板操作

如果你是第一次购买，糖糕云会发一份邮件到你的邮箱（注册时填的）。  
按照提示设置面板登录密码。
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/mcserver_login.png" width = "50%" height = "50%" />
</div>

登录面板，点击购买的服务器
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/mcserver_login_2.png" width = "50%" height = "50%" />
</div>

点击“文件”  
将除了`eula.txt`、`server.properties`的文件都删除
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/mcserver_login_3.png" width = "50%" height = "50%" />
</div>

然后上传服务端  
笔者制作了一些主流版本的Paper服务端，内置跨版本和皮肤插件，可以使用 1.7.10-1.21.4 进入服务器  
>服务端：[点击下崽](https://pan.quark.cn/s/3f17a54b6069)  
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/mcserver_login_4.png" width = "50%" height = "50%" />
</div>

上传完后，解压
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/mcserver_login_5.png" width = "50%" height = "50%" />
</div>

接着，点击“启动”，修改“Docker 镜像”  
不同版本选用不同的JAVA，部分整合包可能会需要JAVA11

|     MC版本      | JAVA版本 |
| :-----------: | :----: |
| 1.7.10-1.16.5 |   8    |
| 1.18.2-1.20.1 |   17   |
|    1.20.5+    |   21   |

<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/mcserver_login_6.png" width = "50%" height = "50%" />
</div>

然后就可以启动了

如果你需要更换服务器存档，就将`world`、`world_nether`、`world_the_end` 3个文件夹删掉  
<div  align="center">    
<img src="https://ypy-uss.yuwan886.top/YW-docs/tutorial/tg/mcserver_world.png" width = "50%" height = "50%" />
</div>

然后新建一个`world`文件夹，进入`world`文件夹，上传地图压缩包，然后解压