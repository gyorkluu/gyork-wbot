# WindowsBot开发手册

## 主函数示例

```
constWindowsBot=require('WindowsBot');//引用WindowsBot模块

//注册主函数
WindowsBot.registerMain(windowsMain,"127.0.0.1",26678);

/**用作代码提示，windowsMain函数会被多次调用，注意使用全局变量
* @param {WindowsBot} windowsBot
*/
asyncfunction windowsMain(windowsBot){
    //设置隐式等待
    await windowsBot.setImplicitTimeout(5000);

    let hwnd =await windowsBot.findWindow(null,"运行");
    await windowsBot.clickElement(hwnd,"Window/Button[2]",1);
}
```

## 注册主函数

```
WindowsBot.registerMain(windowsMain,"127.0.0.1",26678,"../");
//参数一 回调函数，要注册的函数，必须含一个参数，用作接收WindowsBot对象
//参数二 字符串型， 脚本所在的地址，传递给WindowsDriver.exe。如果值为 "127.0.0.1"脚本会将参数 ip和port作为启动参数并启动WindowsDriver.exe，否则用户需要手动启动WindowsDriver.exe 并且提供启动参数。
//命令行启动示例：WindowsDriver.exe "192.168.1.88" 26678
//脚本多进程需要指定不同的端口！
//参数三 整型，监听端口, WindowsDriver.exe。默认26678。WindowsDriver.exe会通过ip和port 连接脚本
//参数四 字符串型，驱动程序所在的文件夹，默认 "../"

''' 代码示例
//远程云端部署
WindowsBot.registerMain(windowsMain, "192.168.1.88", 26678);
'''
```

## 等待超时

```
await windowsBot.sleep(3000);
//显示等待
//参数一 整型，等待时间，单位毫秒

await windowsBot.setImplicitTimeout(waitMs, intervalMs =5);
//隐式等待
//参数一 整型，等待时间，单位毫秒
//参数二 整型，心跳间隔，单位毫秒。可选参数，默认5毫秒
//作用全局，程序起始设置一次即可。并发会影响实际等待时间
```

## 查找句柄

```
await windowsBot.findWindow(className, windowName);
//查找窗口句柄，仅查找顶级窗口，不包含子窗口
//参数一 字符串型，窗口类名
//参数二 字符串型，窗口名
//成功返回窗口句柄，失败返回null

''' 代码示例
//不同的应用中相同窗口类名比较常见，使用类名查找句柄要确保窗口类名唯一性
//通过类名查找句柄
let hwnd = await windowsBot.findWindow("#32770", null);

//通过窗口名称查找句柄
let hwnd = await windowsBot.findWindow(null, "运行");

//通过窗口名称和类名查找句柄
let hwnd = await windowsBot.findWindow("#32770", "运行");
'''


await windowsBot.findWindows(className, windowName);
//查找窗口句柄数组，仅查找顶级窗口，不包含子窗口。className和windowNmae都为null，则返回所有窗口句柄
//参数一 字符串型，窗口类名
//参数二 字符串型，窗口名
//成功返回窗口句柄数组，失败返回null

''' 代码示例
//通过类名查找句柄数组
let hwnds = await windowsBot.findWindow("Chrome_WidgetWin_1", null);
'''


await windowsBot.findSubWindow(curHwnd, className, windowName);
//查找子窗口句柄
//参数一 字符串/整型，当前窗口句柄
//参数二 字符串型，窗口类名
//参数三 字符串型，窗口名
//成功返回窗口句柄，失败返回null

''' 代码示例
//查找指定窗口的子窗口句柄
let hwnd = await windowsBot.findWindow("#32770", "设备投屏1");
let subHwnd = await windowsBot.findSubWindow(hwnd, null, "001  GDBNW19A45831389");
'''


await windowsBot.findParentWindow(curHwnd);
//查找父窗口句柄
//参数一 字符串/整型，当前窗口句柄
//成功返回窗口句柄，失败返回null

await windowsBot.findDesktopWindow();
//查找桌面窗口句柄
//成功返回窗口句柄，失败返回null
```

## 获取窗口名称

```
await windowsBot.getWindowName(hwnd);
//参数一 字符串/整型，窗口句柄
//成功返回窗口名称，失败返回null
```

## 窗口操作

```
await windowsBot.showWindow(hwnd, isShow);
//参数一 字符串/整型，窗口句柄
//参数二 布尔型，显示窗口 true， 隐藏窗口 false
//成功返回true，失败返回false

await windowsBot.setWindowTop(hwnd, isTop);
//设置窗口到最顶层
//参数一 字符串/整型，窗口句柄
//参数二 整型，是否置顶。true置顶， false取消置顶
//成功返回true，失败返回false

await windowsBot.getWindowPos(hwnd);
//获取窗口位置
//参数一 字符串/整型，窗口句柄
//成功返回窗口位置，失败返回null

await windowsBot.setWindowPos(hwnd, left, top, width, height);
//设置窗口位置
//参数一 字符串/整型，窗口句柄
//参数二 整型，左上角横坐标
//参数三 整型，左上角纵坐标
//参数四 整型，窗口宽度
//参数五 整型，窗口高度
//成功返回true，失败返回 false
```

## 鼠标键盘

```
await windowsBot.moveMouse(hwnd, x, y, options ={});
//移动鼠标
//参数一 字符串/整型，窗口句柄
//参数二 整型，横坐标
//参数三 整型，纵坐标
//参数四 JSON类型，可选参数{{mode:boolean, elementHwnd:string|number}} options 操作模式，后台 true，前台 false。默认前台操作。
//如果mode值为true且目标控件有单独的句柄，则需要通过getElementWindow获得元素句柄，指定elementHwnd的值(新板本底层代码会自动获取子窗口句柄)
//总是返回true

''' 代码示例
//前台移动鼠标
await windowsBot.moveMouse(hwnd, 100, 200);

//后台移动鼠标
await windowsBot.moveMouse(hwnd, 100, 200, {mode:true});
'''


await windowsBot.moveMouseRelative(hwnd, x, y, mode =false);
//移动鼠标(相对坐标)
//参数一 字符串/整型，窗口句柄
//参数二 整型，相对横坐标
//参数三 整型，相对纵坐标
//参数四 布尔型，操作模式，后台 true，前台 false。默认前台操作
//总是返回true

await windowsBot.rollMouse(hwnd, x, y, dwData, mode =false);
//滚动鼠标
//参数一 字符串/整型，窗口句柄
//参数二 整型，滚动前鼠标指针的横坐标
//参数三 整型，滚动前鼠标指针的纵坐标
//参数四 整型，鼠标滚动次数,负数下滚鼠标,正数上滚鼠标
//参数五 布尔型，操作模式，后台 true，前台 false。默认前台操作
//总是返回true

await windowsBot.clickMouse(hwnd, x, y, msg, options ={});
//鼠标点击
//参数一 字符串/整型，窗口句柄
//参数二 整型，横坐标
//参数三 整型，纵坐标
//参数四 整型，点击类型，单击左键:1 单击右键:2 按下左键:3 弹起左键:4 按下右键:5 弹起右键:6 双击左键:7 双击右键:8
//参数五 JSON类型，可选参数{{mode:boolean, elementHwnd:string|number}} options 操作模式，后台 true，前台 false。默认前台操作。
//如果mode值为true且目标控件有单独的句柄，则需要通过getElementWindow获得元素句柄，指定elementHwnd的值(新板本底层代码会自动获取子窗口句柄)
//总是返回true。

''' 代码示例
//前台单击左键
let hwnd = await windowsBot.findWindow(null, "运行");
await windowsBot.clickMouse(hwnd, 100, 200, 1);

//后台单击左键(目标坐标点没有单独的句柄)
await windowsBot.clickMouse(hwnd, 100, 200, 1, {mode:true});

//后台单击左键(目标坐标点有单独的句柄)
let subHwnd = await windowsBot.getElementWindow(hwnd, "Window/Button[2]"); 
await windowsBot.clickMouse(hwnd, 100, 200, 1, {mode:true, elementHwnd:subHwnd});
'''


await windowsBot.sendKeys(text);
//输入文本
//参数一 字符串型，输入的文本
//总是返回true

await windowsBot.sendKeysByHwnd(hwnd, text);
//后台输入文本(杀毒软件可能会拦截)
//参数一 字符串/整型，窗口句柄，如果目标控件有单独的句柄，需要通过getElementWindow获得句柄
//参数二 字符串型，输入的文本
//总是返回true

''' 代码示例
//后台输入文本(目标坐标点有单独的句柄)
let hwnd = await windowsBot.findWindow(null, "运行");
let subHwnd = await windowsBot.getElementWindow(hwnd, "ComboBox/Edit"); 
await windowsBot.sendKeysByHwnd(subHwnd, "cmd");
'''


await windowsBot.sendVk(bVk, msg);
//输入虚拟键值(VK)
//参数一 整型，VK键值
//参数二 整型，输入类型，按下弹起:1 按下:2 弹起:3
//总是返回true

await windowsBot.sendVkByHwnd(hwnd, bVk, msg);
//后台输入虚拟键值(VK) (杀毒软件可能会拦截)
//参数一 字符串/整型，窗口句柄，如果目标控件有单独的句柄，需要通过getElementWindow获得句柄
//参数二 整型，VK键值
//参数三 整型，输入类型，按下弹起:1 按下:2 弹起:3
//总是返回true。若是后台组合键，可使用sendVk 按下控制键(Alt、Shift、Ctrl...)，再组合其他按键

''' 代码示例
//后台输入键盘"A"(目标坐标点有单独的句柄)
let hwnd = await windowsBot.findWindow(null, "运行");
let subHwnd = await windowsBot.getElementWindow(hwnd, "ComboBox/Edit"); 
await windowsBot.sendVkByHwnd(subHwnd, 0x41, 1);
'''
```

## 图色操作

```
await windowsBot.saveScreenshot(hwnd, savePath, options ={});
//截图保存
//参数一 字符串/整型，窗口句柄
//参数二 字符串类型，保存图片路径。
//参数三 JSON类型，可选参数{{region:[left:number, top:number, right:number, bottom:number], threshold:[thresholdType:number, thresh:number, maxval:number], mode:boolean}} options 
//region截图区域 [10, 20, 100, 200], 默认 hwnd对应的窗口
//threshold二值化图片, thresholdType算法类型：
//                                            0   THRESH_BINARY算法，当前点值大于阈值thresh时，取最大值maxva，否则设置为0
//                                            1   THRESH_BINARY_INV算法，当前点值大于阈值thresh时，设置为0，否则设置为最大值maxva
//                                            2   THRESH_TOZERO算法，当前点值大于阈值thresh时，不改变，否则设置为0
//                                            3   THRESH_TOZERO_INV算法，当前点值大于阈值thresh时，设置为0，否则不改变
//                                            4   THRESH_TRUNC算法，当前点值大于阈值thresh时，设置为阈值thresh，否则不改变
//                                            5   ADAPTIVE_THRESH_MEAN_C算法，自适应阈值
//                                            6   ADAPTIVE_THRESH_GAUSSIAN_C算法，自适应阈值
//                                            thresh阈值，maxval最大值，threshold默认保存原图。thresh和maxval同为255时灰度处理
//mode操作模式，后台 true，前台 false。默认前台操作   
//成功返回true，失败返回false

''' 代码示例
//截取窗口全屏，图片保存至d:\\1.png
let savePath = "d:\\1.png";
await windowsBot.saveScreenshot(hwnd, savePath);

//二值化区域截图，区域起始坐标位置(10,20)，右下角坐标位置(100,200)。二值化使用THRESH_BINARY算法。阈值127，最大值255
let options = {region:[10, 20, 100, 100], threshold:[0, 127, 255]};
await windowsBot.saveScreenshot(hwnd, savePath, options);
'''


await windowsBot.getColor(hwnd, x, y, mode =false);
//获取指定坐标点的色值
//参数一 字符串/整型，窗口句柄
//参数二 整型，横坐标
//参数三 整型，纵坐标
//参数四 布尔型，操作模式，可选参数，后台 true，前台 false。默认前台操作
//成功返回#开头的颜色值，失败返回null

await windowsBot.findImage(hwndOrBigImagePath, smallImagePath, options ={});
//找图
//参数一 字符串/整型，窗口句柄或者图片路径
//参数二 字符串，小图片路径，多张小图查找应当用"|"分开小图路径
//参数三 JSON类型，可选参数，{{region:[left:number, top:number, right:number, bottom:number], sim:number, threshold:[thresholdType:number, thresh:number, maxval:number], mode:boolean}} options
//region 指定区域找图 [10, 20, 100, 200]，region默认 hwnd对应的窗口
//sim浮点型 图片相似度 0.0-1.0，sim默认0.95
//threshold二值化图片, thresholdType算法类型：
//                                            0   THRESH_BINARY算法，当前点值大于阈值thresh时，取最大值maxva，否则设置为0
//                                            1   THRESH_BINARY_INV算法，当前点值大于阈值thresh时，设置为0，否则设置为最大值maxva
//                                            2   THRESH_TOZERO算法，当前点值大于阈值thresh时，不改变，否则设置为0
//                                            3   THRESH_TOZERO_INV算法，当前点值大于阈值thresh时，设置为0，否则不改变
//                                            4   THRESH_TRUNC算法，当前点值大于阈值thresh时，设置为阈值thresh，否则不改变
//                                            5   ADAPTIVE_THRESH_MEAN_C算法，自适应阈值
//                                            6   ADAPTIVE_THRESH_GAUSSIAN_C算法，自适应阈值
//                                            thresh阈值，maxval最大值，threshold默认保存原图。thresh和maxval同为255时灰度处理
//multi 找图数量，默认为1,找单个图片坐标
//mode 操作模式，后台 true，前台 false。默认前台操作   
//成功返回，单个坐标点 [{x:number, y:number}]，多坐标点图[{x1:number, y1:number}, {x2:number, y2:number}...] 失败返回null

''' 代码示例
//全屏找图
let smallImagePath = "d:\\1.png";
await windowsBot.findImage(hwnd, smallImagePath);

//区域+模糊 找图，区域起始坐标位置(10, 15)，右下角坐标位置(100, 100)。图片相似度设置为95%
let options = {region:[10, 15, 100, 100], sim:0.95};
await windowsBot.findImage(hwnd, smallImagePath, options);

//二值化，使用THRESH_BINARY算法，阈值127 最大值255。二值化找图需要在截图工具设置相同的算法、阈值和最大值
let options = {threshold:[0, 127, 255]};
await windowsBot.findImage(hwnd, smallImagePath, options);

//找多张相同图片坐标，返回坐标数组。
let options = {multi:3};
await windowsBot.findImage(hwnd, smallImagePath, options);
'''


await windowsBot.findAnimation(hwnd, frameRate, options ={});
//找动态图
//参数一 字符串/整型，窗口句柄
//参数二 整型，前后两张图相隔的时间，单位毫秒
//参数三 JSON类型，可选参数，{{region:[left:number, top:number, right:number, bottom:number], mode:boolean}} options
//region 指定区域找图 [10, 20, 100, 200]，region默认 hwnd对应的窗口
//mode 操作模式，后台 true，前台 false。默认前台操作   
//成功返回，单个坐标点 [{x:number, y:number}]，多坐标点图[{x1:number, y1:number}, {x2:number, y2:number}...] 失败返回null

''' 代码示例
//在100毫秒内找出图片内变化的位置，其他参数参考findImage函数
await windowsBot.findAnimation(hwnd, 100);
'''


await windowsBot.findColor(hwnd, mainColor, options ={});
//查找指定色值的坐标点
//参数一 字符串/整型，窗口句柄
//参数二 字符串，#开头的色值
//参数三 JSON类型，可选参数，{{subColors:[[offsetX:number, offsetY:number, strSubColor:string], ...], region:[left:number, top:number, right:number, bottom:numbe], sim:number, mode:boolean}} options
//subColors 相对于mainColor 的子色值，[[offsetX, offsetY, "#FFFFFF"], ...]，subColors默认为null
//region 指定区域找图 [10, 20, 100, 200]，region默认 hwnd对应的窗口
//sim相似度0.0-1.0，sim默认为1
//mode 操作模式，后台 true，前台 false。默认前台操作   
//成功返回{x:number, y:number} 失败返回null

''' 代码示例
//指定区域+模糊 找色。区域起始坐标位置(10, 20)，右下角坐标位置(100, 200)。颜色相似度设置为95%
let mainColor = "#ffff00";
let options = {region:[10, 20, 100, 200], sim:0.95};
await windowsBot.findColor(hwnd, mainColor, options);

//多点区域找色。区域起始坐标位置(10, 20)，右下角坐标位置(100, 200)。主颜色与3个子颜色 点的偏移坐标点。偏移点的计算(子颜色坐标点-主颜色坐标点)
let mainColor = "#ffff00";
let options = {region:[10, 20, 100, 200], subColors:[[8, 2, "#a09588"], [9, 5, "#ffffff"], [10, 6, "#ffdc92"]]};
await windowsBot.findColor(hwnd, mainColor, options);
'''


await windowsBot.compareColor(hwnd, mainX, mainY, mainColor, options ={});
//比较指定坐标点的颜色值
//参数一 字符串/整型，窗口句柄
//参数二 整型，主颜色所在的X坐标
//参数三 整型，主颜色所在的Y坐标
//参数四 字符串，#开头的色值
//参数五 JSON类型，可选参数，{{subColors:[[offsetX:number, offsetY:number, strSubColor:string], ...], region:[left:number, top:number, right:number, bottom:number], sim:number, mode:boolean}} options
//subColors 相对于mainColor 的子色值，[[offsetX, offsetY, "#FFFFFF"], ...]，subColors默认为null
//region 指定区域找图 [10, 20, 100, 200]，region默认 hwnd对应的窗口
//sim相似度0.0-1.0，sim默认为1
//成功返回true 失败返回 false

''' 代码示例
//多点+模糊比色，主颜色值"#ffff00" 坐标位置(100,150)。主颜色与3个子颜色 点的偏移坐标点。偏移点的计算(子颜色坐标点-主颜色坐标点)。颜色相似度98%
let options = {subColors:[[8, 2, "#a09588"], [9, 5, "#ffffff"], [10, 6, "#ffdc92"]], sim:0.98};
await windowsBot.compareColor(hwnd, 100, 150, "#ffff00", options);
'''


await windowsBot.extractImageByVideo(videoPath, saveFolder, jumpFrame);
//提取视频帧
//参数一 字符串类型， 视频路径
//参数二 字符串类型， 提取的图片保存的文件夹目录
//参数三 整型，jumpFrame 跳帧，默认为1 不跳帧
//成功返回true，失败返回false

await windowsBot.cropImage(imagePath, savePath, left, top, rigth, bottom);
//裁剪图片
//参数一 字符串类型，图片路径
//参数一 字符串类型，裁剪后保存的图片路径
//参数三 整型，裁剪的左上角横坐标
//参数四 整型，裁剪的左上角纵坐标
//参数五 整型，裁剪的右下角横坐标
//参数六 整型，裁剪的右下角纵坐标
//成功返回true，失败返回false
```

## OCR系统

```
await windowsBot.findWords(ocrServerIp, hwndOrImagePath, words, options ={})
//找字
//参数一 字符串型，ocr服务IP或域名。固定9527。
//参数二 字符串/整型，窗口句柄或者图片路径
//参数三 字符串类型，要查找的文字
//参数四 JSON类型，可选参数 {region:[left:number, top:number, right:number, bottom:number], threshold:[thresholdType:number, thresh:number, maxval:number], mode:boolean} options
//region 指定区域 [10, 20, 100, 200]，region默认全图
//threshold二值化图片, thresholdType算法类型：
//                                          0   THRESH_BINARY算法，当前点值大于阈值thresh时，取最大值maxva，否则设置为0
//                                          1   THRESH_BINARY_INV算法，当前点值大于阈值thresh时，设置为0，否则设置为最大值maxva
//                                          2   THRESH_TOZERO算法，当前点值大于阈值thresh时，不改变，否则设置为0
//                                          3   THRESH_TOZERO_INV算法，当前点值大于阈值thresh时，设置为0，否则不改变
//                                          4   THRESH_TRUNC算法，当前点值大于阈值thresh时，设置为阈值thresh，否则不改变
//                                          5   ADAPTIVE_THRESH_MEAN_C算法，自适应阈值
//                                          6   ADAPTIVE_THRESH_GAUSSIAN_C算法，自适应阈值
//                    thresh阈值，maxval最大值，threshold默认保存原图。thresh和maxval同为255时灰度处理
//mode 操作模式，后台 true，前台 false。默认前台操作, 仅适用于hwnd
//成功功返回数组[{x:number, y:number}, ...]，文字所在的坐标点， 失败返回null

''' 代码示例
//后台区域找字
await windowsBot.findWords(hwnd, "192.168.1.188", "rpa", {region:[10, 20, 100, 200], mode:true});

//二值化处理后找字
await windowsBot.findWords(hwnd, "192.168.1.188", 'rpa', {threshold:[0, 100, 255]});
'''


await windowsBot.getWords(ocrServerIp, hwndOrImagePath, options ={})
//获取屏幕文字
//参数一 字符串型，ocr服务IP或域名。固定9527。
//参数二 字符串/整型，窗口句柄或者图片路径
//参数三 JSON类型，可选参数 {region:[left:number, top:number, right:number, bottom:number], threshold:[thresholdType:number, thresh:number, maxval:number], mode:boolean} options
//region 指定区域 [10, 20, 100, 200]，region默认全图
//threshold二值化图片, thresholdType算法类型：
//                                          0   THRESH_BINARY算法，当前点值大于阈值thresh时，取最大值maxva，否则设置为0
//                                          1   THRESH_BINARY_INV算法，当前点值大于阈值thresh时，设置为0，否则设置为最大值maxva
//                                          2   THRESH_TOZERO算法，当前点值大于阈值thresh时，不改变，否则设置为0
//                                          3   THRESH_TOZERO_INV算法，当前点值大于阈值thresh时，设置为0，否则不改变
//                                          4   THRESH_TRUNC算法，当前点值大于阈值thresh时，设置为阈值thresh，否则不改变
//                                          5   ADAPTIVE_THRESH_MEAN_C算法，自适应阈值
//                                          6   ADAPTIVE_THRESH_GAUSSIAN_C算法，自适应阈值
//                    thresh阈值，maxval最大值，threshold默认保存原图。thresh和maxval同为255时灰度处理
//mode 操作模式，后台 true，前台 false。默认前台操作, 仅适用于hwnd
//成功以数组字符串的形式返识别的文字, 失败返回null

''' 代码示例
//获取图片上的文字
let words = await windowsBot.getWords("192.168.1.188", "d:\\1.png");
console.log(words);
'''
```

## YOLO目标检测

```
await windowsBot.yolo(yoloServerIp, hwndOrFile, options ={});
//yolo目标检测
//参数一 字符串型，yolo服务IP或域名。固定9528
//参数二 字符串/整型，窗口句柄或者图片路径
//参数三 JSON类型，可选参数 {region:[left:number, top:number, right:number, bottom:number], mode:boolean} options
//region 指定区域 [10, 20, 100, 200]，region默认全图。区域设置应当和训练时区域一致
//mode 操作模式，后台 true，前台 false。默认前台操作, 仅适用于hwnd，文件识别会自动忽略此参数
//失败返回null，成功返回数组json形式的识别结果。 
```

## 元素操作

```
await windowsBot.getElements(hwnd, ocrServer =null);
//获取所有可见元素信息
//参数一 字符串/整型，窗口句柄。
//参数二 字符串类型，ocr服务端IP，端口固定为9527，默认为 null。若提供此参数，则返回结果增加 words 字段，包含界面中所有的文字区域
//成功返回json格式的元素信息，失败返回null

await windowsBot.getElementName(hwnd, xpath);
//获取元素名称
//参数一 字符串/整型，窗口句柄。如果是java窗口并且窗口句柄和元素句柄不一致，需要使用getElementWindow获取窗口句柄。
//getElementWindow参数的xpath，Aibote Tool应当使用正常模式下获取的XPATH路径，不要 “勾选java窗口” 复选按钮。对话框子窗口，需要获取对应的窗口句柄操作
//参数二 字符串型，元素路径
//成功返回元素名称，失败返回null

''' 代码示例
//遍历xpath 获取所有兄弟节点name
for(let i = 0; ; i++){
    let text = await windowsBot.getElementName(hwnd, `Pane[2]/Pane/Pane/Pane/Pane[1]/Pane/Pane/Pane/Pane/Pane/Pane/Pane/Pane[2]/List/List/ListItem[${i}]`);//模板字符串
    if(text == null)
        break;

    console.log(text);
}
'''


await windowsBot.getElementValue(hwnd, xpath);
//获取元素文本
//参数一 字符串/整型，窗口句柄
//参数二 字符串型，元素路径
//成功返回元素文本，失败返回null

await windowsBot.getElementRect(hwnd, xpath);
//获取元素矩形大小
//参数一 字符串/整型，窗口句柄。如果是java窗口并且窗口句柄和元素句柄不一致，需要使用getElementWindow获取窗口句柄。
//getElementWindow参数的xpath，Aibote Tool应当使用正常模式下获取的XPATH路径，不要 “勾选java窗口” 复选按钮。对话框子窗口，需要获取对应的窗口句柄操作
//参数二 字符串型，元素路径
//成功返回{left:number, top:number, right:number, bottom:number}，失败返回null

await windowsBot.getElementWindow(hwnd, xpath);
//获取元素窗口句柄
//参数一 字符串/整型，窗口句柄
//参数二 字符串型，元素路径
//成功返回窗口句柄，失败返回null

await windowsBot.clickElement(hwnd, xpath, msg);
//点击元素
//参数一 字符串/整型，窗口句柄。如果是java窗口并且窗口句柄和元素句柄不一致，需要使用getElementWindow获取窗口句柄。
//getElementWindow参数的xpath，Aibote Tool应当使用正常模式下获取的XPATH路径，不要 “勾选java窗口” 复选按钮。对话框子窗口，需要获取对应的窗口句柄操作
//参数二 字符串型，元素路径
//参数三 整型，点击类型，单击左键:1 单击右键:2 按下左键:3 弹起左键:4 按下右键:5 弹起右键:6 双击左键:7 双击右键:8
//成功返回true 失败返回 false。如果此函数不能点击，可尝试使用invokeElement函数

await windowsBot.invokeElement(hwnd, xpath);
//执行元素默认操作(一般是点击操作)
//参数一 字符串/整型，窗口句柄。
//参数二 字符串型，元素路径
//成功返回true 失败返回 false。

await windowsBot.setElementFocus(hwnd, xpath);
//设置元素作为焦点
//参数一 字符串/整型，窗口句柄
//参数二 字符串型，元素路径
//成功返回true 失败返回 false

await windowsBot.setElementValue(hwnd, xpath,value);
//设置元素文本
//参数一 字符串/整型，窗口句柄。如果是java窗口并且窗口句柄和元素句柄不一致，需要使用getElementWindow获取窗口句柄。
//getElementWindow参数的xpath，Aibote Tool应当使用正常模式下获取的XPATH路径，不要 “勾选java窗口” 复选按钮。对话框子窗口，需要获取对应的窗口句柄操作
//参数二 字符串型，元素路径
//参数三 字符串型，要设置的内容
//成功返回true 失败返回 false

await windowsBot.setElementScroll(hwnd, xpath, horizontalPercent, verticalPercent);
//滚动元素
//参数一 字符串/整型，窗口句柄
//参数二 字符串型，元素路径（滚动条所属的窗口路径，非滚动条路径）
//参数三 整型，水平百分比 -1不滚动
//参数四 整型，垂直百分比 -1不滚动。例如设置50，则垂直方向滚动到中间
//成功返回true 失败返回 false

await windowsBot.isSelected(hwnd, xpath);
//单/复选框是否选中
//参数一 字符串/整型，窗口句柄
//参数二 字符串型，元素路径
//成功返回true 失败返回 false

await windowsBot.closeWindow(hwnd, xpath);
//关闭窗口
//参数一 字符串/整型，窗口句柄。如果是java窗口并且窗口句柄和元素句柄不一致，需要使用getElementWindow获取窗口句柄。
//getElementWindow参数的xpath，Aibote Tool应当使用正常模式下获取的XPATH路径，不要 “勾选java窗口” 复选按钮。对话框子窗口，需要获取对应的窗口句柄操作
//参数二 字符串型，元素路径
//成功返回true 失败返回 false

await windowsBot.setWindowState(hwnd, xpath, state);
//设置窗口状态
//参数一 字符串/整型，窗口句柄。如果是java窗口并且窗口句柄和元素句柄不一致，需要使用getElementWindow获取窗口句柄。
//getElementWindow参数的xpath，Aibote Tool应当使用正常模式下获取的XPATH路径，不要 “勾选java窗口” 复选按钮。对话框子窗口，需要获取对应的窗口句柄操作
//参数二 字符串型，元素路径
//参数三 整型，0正常 1最大化 2 最小化
//成功返回true 失败返回 false
```

## 系统剪切板

```
await windowsBot.setClipboardText(text);
//设置剪切板内容
//参数一 字符串型，设置的文本
//成功返回true 失败返回 false

await windowsBot.getClipboardText();
//获取剪切板内容
//返回剪切板文本
```

## 启动进程

```
await windowsBot.startProcess(commandLine, showWindow =true, isWait =false);
//参数一 字符串型，启动命令行
//参数二 布尔型，是否显示窗口。可选参数,默认显示窗口
//参数三 布尔型，是否等待程序结束。可选参数,默认不等待
//成功返回true,失败返回false

''' 代码示例
//后台启动应用程序
await windowsBot.startProcess("d:\\Aibote\\Aibote.exe",  false, false);

//启动WindowsDriver.exe 指定启动参数
await windowsBot.startProcess("WindowsDriver.exe \"192.168.1.88\" 26672",  true, false);

//启动WindowsDriver.exe 指定启动参数并且等待进程关闭
await windowsBot.startProcess("WindowsDriver.exe \"192.168.1.88\" 26672",  true, true);
'''
```

## 执行cmd命令

```
await windowsBot.executeCommand(command, waitTimeout =300);
//此函数用于获取cmd执行结果，函数执行完毕会自动关闭启动的相关进程
//参数一 字符串型，cmd命令
//参数二 整型，可选参数，等待结果返回超时，单位毫秒，默认300毫秒
//返回cmd执行结果

''' 代码示例
//执行cmd 等待3000毫秒返回结果
await windowsBot.executeCommand("ping www.baidu.com", 3000);
'''
```

## 指定url下载文件

```
await windowsBot.downloadFile(url, filePath, isWait);
//参数一 字符串型，文件地址
//参数二 字符串型，文件保存的路径
//参数三 布尔型，是否等待.为true时,等待下载完成
//总是返回true
```


## 播放音视频

```
await windowsBot.playAudio(audioPath, isWait);
//播报音频文件
//参数一 字符串型，音频文件路径
//参数二 布尔类型，是否等待.为true时,等待播放完毕
//成功返回true，失败返回false。

await windowsBot.playAudioEx(audioPath, enableRandomParam, isWait);
//播报音频文件(EX)，不能与 metahumanSpeechByFileEx 同步执行
//参数一 字符串型，音频文件路径
//参数二 布尔类型，是否启用随机去重参数
//参数三 布尔类型，是否等待。为true时,等待播放完毕
//总是返回true，函数仅添加播放音频文件到队列不处理返回

await windowsBot.playMedia(videoPath, videoSacle, isLoopPlay, enableRandomParam, isWait);
//播报视频频文件 (多个视频切换播放 视频和音频编码必须一致)
//参数一 字符串型，视频文件路径
//参数二 浮点型，视频缩放（0.5缩小一半，1.0为原始大小）
//参数三 布尔类型，是否循环播放
//参数四 布尔类型，是否启用随机去重参数
//参数五 布尔类型，是否等待播报完毕。值为false时，不等待播放结束。未播报结束前再次调用此函数 会终止前面的播报内容。
//成功返回true，失败返回false。

await windowsBot.setMediaVolumeScale(volumeScale);
//调节 playMedia 音量大小(底层用的内存共享，支持多进程控制)
//参数一 浮点型，音量缩放（0.5调低一半，1.0为原始音量大小）。默认为原始大小
//总是返回true
```

## 音视频处理

```
await windowsBot.extractAudio(videoPath);
//导出音频文件，依赖 ffmpeg
//参数一 字符串型，视频文件路径
//失败返回false,成功返回true 并保存与视频同名的 .mp3 后缀文件
```


## 获取Windows ID

```
await windowsBot.getWindowsId();
//成功返回Windows 唯一标志
```

## 关闭WindowsDriver.exe驱动程序

```
await windowsBot.closeDriver();
```
