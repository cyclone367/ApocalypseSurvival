export const questions = [
  {
    day: 1,
    scene: "凌晨 06:17，警报把你从床上拽起来。窗外的街道已经乱成一团，你的手机只剩 38% 电量。",
    prompt: "你先做什么？",
    options: [
      { text: "锁门拉窗帘，清点饮水和药品", feedback: "门锁咔哒一声落下。至少现在，你还有一个安全的房间。", scores: { survival: 3, social: 0, sanity: 2, chaos: 0 } },
      { text: "给家人朋友挨个打电话", feedback: "电话那头传来熟悉的声音，你的心跳终于慢了一点。", scores: { survival: 0, social: 3, sanity: 1, chaos: 0 } },
      { text: "打开所有群聊，看看谁知道内幕", feedback: "消息刷得比警报还快，真假已经混在了一起。", scores: { survival: 0, social: 2, sanity: 0, chaos: 2 } },
      { text: "先发条朋友圈：这次是真的？", feedback: "发出去的那一刻，你收获了三个问号和一条语音。", scores: { survival: 0, social: 1, sanity: 0, chaos: 3 } }
    ]
  },
  {
    day: 2,
    scene: "停电了。冰箱还在嗡嗡作响，楼道里传来急促的脚步声。你手边有一只背包。",
    prompt: "背包里最先放什么？",
    options: [
      { text: "水、罐头、急救包和手电", feedback: "背包沉了些，但每一件都能派上用场。", scores: { survival: 3, social: 0, sanity: 1, chaos: 0 } },
      { text: "充电宝、收音机和备用电池", feedback: "至少你还听得见外面的消息，也能留住一点电量。", scores: { survival: 2, social: 0, sanity: 2, chaos: 0 } },
      { text: "多装几份食物，给邻居也带上", feedback: "多一份食物，就多一份同行的可能。", scores: { survival: 1, social: 3, sanity: 0, chaos: 0 } },
      { text: "游戏机和珍藏手办，人生不能没爱好", feedback: "收拾完后，你的背包意外地有了收藏柜的重量。", scores: { survival: 0, social: 0, sanity: 1, chaos: 3 } }
    ]
  },
  {
    day: 3,
    scene: "楼下有人敲门，说自己的孩子发烧了，急需退烧药。你储物柜里还剩最后一盒。",
    prompt: "你会怎么做？",
    options: [
      { text: "给他药，再帮忙确认用量", feedback: "门外的道谢声很轻，却让这栋楼没那么陌生了。", scores: { survival: 0, social: 3, sanity: 1, chaos: 0 } },
      { text: "分一半，留下足够应急的量", feedback: "你保住了自己的余地，也把一点希望递了出去。", scores: { survival: 2, social: 2, sanity: 1, chaos: 0 } },
      { text: "先隔门询问症状和身份", feedback: "谨慎没有消除不安，但让你的决定更有根据。", scores: { survival: 2, social: 0, sanity: 2, chaos: 0 } },
      { text: "隔门说没有药，然后把门反锁两遍", feedback: "门外安静下来，你却开始留意每一个楼道声响。", scores: { survival: 2, social: -1, sanity: -1, chaos: 1 } }
    ]
  },
  {
    day: 4,
    scene: "无线电断断续续地播报：城北体育馆设有临时安置点。窗外，一辆装甲车正驶向相反方向。",
    prompt: "你准备去哪边？",
    options: [
      { text: "按广播路线去体育馆", feedback: "你沿着路标前进，希望人群能带来秩序。", scores: { survival: 1, social: 2, sanity: 1, chaos: 0 } },
      { text: "跟着装甲车，看看部队去哪", feedback: "引擎声渐远，你选择相信一条看得见的路线。", scores: { survival: 3, social: 0, sanity: 1, chaos: 0 } },
      { text: "先在楼顶观察十分钟再决定", feedback: "多等的十分钟让你看清了路口的拥堵。", scores: { survival: 2, social: 0, sanity: 2, chaos: 0 } },
      { text: "两边都不去，临时做个路牌骗人群绕路", feedback: "你获得了一条空旷的街道，以及一份说不清的心虚。", scores: { survival: 1, social: -1, sanity: 0, chaos: 3 } }
    ]
  },
  {
    day: 5,
    scene: "体育馆外排起长队。一个拿着扩音器的人说，交出所有食物才能进场；队伍里有人开始争吵。",
    prompt: "你怎么处理？",
    options: [
      { text: "按规则交出一部分物资，先进去", feedback: "你把能承受的代价交了出去，换来一处暂时的屋檐。", scores: { survival: 2, social: 1, sanity: 1, chaos: 0 } },
      { text: "和周围人一起问清物资去向", feedback: "几个人站到了一起，对方终于把扩音器放低了。", scores: { survival: 1, social: 3, sanity: 1, chaos: 0 } },
      { text: "悄悄绕到后门找工作人员", feedback: "后门没有队伍，但你也暂时失去了同伴的照应。", scores: { survival: 2, social: 0, sanity: 1, chaos: 1 } },
      { text: "冲上去抢扩音器宣布自己接管", feedback: "全场看着你。局面确实安静了，只是不知道能安静多久。", scores: { survival: 0, social: 1, sanity: 0, chaos: 3 } }
    ]
  },
  {
    day: 6,
    scene: "安置点缺水。值守的人说水车明早才到，但角落里已经有人因为一瓶水吵了起来。",
    prompt: "你怎么应对？",
    options: [
      { text: "制定每人定量的分水表", feedback: "清清楚楚的刻度让争执暂时停了下来。", scores: { survival: 2, social: 2, sanity: 2, chaos: 0 } },
      { text: "把自己的水分给更需要的人", feedback: "有人接过水，也有人默默记住了你的名字。", scores: { survival: -1, social: 3, sanity: 1, chaos: 0 } },
      { text: "不等水车，自己去附近找水源", feedback: "你出发时天色已暗，但至少没有坐等。", scores: { survival: 3, social: 0, sanity: 1, chaos: 1 } },
      { text: "把水瓶藏起来，谁也别想找到", feedback: "水还在手边，周围人的目光却变了。", scores: { survival: 2, social: -2, sanity: -1, chaos: 1 } }
    ]
  },
  {
    day: 7,
    scene: "有人敲响体育馆的侧门。门外站着一位老人，说自己的同伴走散了，想进来找人。",
    prompt: "你会开门吗？",
    options: [
      { text: "先询问姓名和同伴特征，再陪他找", feedback: "你们在登记表里找到了线索，老人紧绷的肩膀松开了。", scores: { survival: 1, social: 3, sanity: 1, chaos: 0 } },
      { text: "让值守人员核验后再放行", feedback: "流程多花了几分钟，但每个人都知道接下来怎么办。", scores: { survival: 2, social: 1, sanity: 2, chaos: 0 } },
      { text: "不开门，把路线告诉他", feedback: "你把门守住了，也看着那道身影重新走进黑暗。", scores: { survival: 2, social: -1, sanity: 0, chaos: 0 } },
      { text: "让他喊一嗓子，看有没有人认识", feedback: "回声在体育馆里打了几个转，角落有人应了一声。", scores: { survival: 0, social: 2, sanity: 0, chaos: 2 } }
    ]
  },
  {
    day: 8,
    scene: "清晨，几个人提议组队去超市搜集物资。货架可能空了，路上也可能有危险。",
    prompt: "你选择哪种角色？",
    options: [
      { text: "画路线、定集合时间和撤退信号", feedback: "每个人都记住了撤退信号，队伍终于像个队伍了。", scores: { survival: 2, social: 1, sanity: 3, chaos: 0 } },
      { text: "带上急救包，负责照看队友", feedback: "你把绷带放在最顺手的位置，准备顾好每个人。", scores: { survival: 1, social: 3, sanity: 1, chaos: 0 } },
      { text: "自己先走小路去探一圈", feedback: "小路避开了人群，也把你和队伍隔开了一段距离。", scores: { survival: 2, social: -1, sanity: 1, chaos: 1 } },
      { text: "穿上显眼的雨衣，自封气氛组", feedback: "队伍里响起了笑声。紧张没有消失，但至少不再那么沉。", scores: { survival: 0, social: 2, sanity: 1, chaos: 2 } }
    ]
  },
  {
    day: 9,
    scene: "超市里一排货架倒了。广播重复播放着三天前的安全提示，远处有东西撞击卷帘门。",
    prompt: "你最先拿什么？",
    options: [
      { text: "饮水、能量食品和止血用品", feedback: "你只装了真正需要的东西，背包还留着行动空间。", scores: { survival: 3, social: 0, sanity: 1, chaos: 0 } },
      { text: "把物资按小组人数平均分配", feedback: "每个人都拿到了份额，没人需要偷偷多塞一罐。", scores: { survival: 1, social: 3, sanity: 1, chaos: 0 } },
      { text: "先找广播室确认外面的情况", feedback: "设备还能用，你终于听到一条不是循环播放的消息。", scores: { survival: 1, social: 0, sanity: 3, chaos: 0 } },
      { text: "购物车能装多少就装多少", feedback: "车轮嘎吱作响，你收获了很多物资和很少的机动性。", scores: { survival: 2, social: 0, sanity: 0, chaos: 2 } }
    ]
  },
  {
    day: 10,
    scene: "回程时，队伍里一位伤员走不动了。天色正在变暗，安全点还有两公里。",
    prompt: "你们怎么办？",
    options: [
      { text: "两人轮流搀扶，重新规划路线", feedback: "队伍走得慢了，但没有人被留在路边。", scores: { survival: 1, social: 3, sanity: 1, chaos: 0 } },
      { text: "把物资减重，做一个简易担架", feedback: "分担重量后，伤员也能跟上队伍的节奏。", scores: { survival: 2, social: 2, sanity: 2, chaos: 0 } },
      { text: "留下水和标记，先带大队回安全点", feedback: "你做了最难的权衡，回头路上不断确认标记还在。", scores: { survival: 2, social: 0, sanity: 2, chaos: 0 } },
      { text: "开免提给伤员放振奋人心的音乐", feedback: "歌声飘过街道，伤员居然真的站起来走了几步。", scores: { survival: 0, social: 1, sanity: 1, chaos: 3 } }
    ]
  },
  {
    day: 11,
    scene: "临时电台开始招募志愿者，负责整理情报、协调物资和安抚新来的人。你被点了名。",
    prompt: "你愿意接下什么？",
    options: [
      { text: "整理可靠消息，标出来源和时间", feedback: "一张清楚的情报表，让传言少跑了好几圈。", scores: { survival: 1, social: 1, sanity: 3, chaos: 0 } },
      { text: "组织轮班，确保每个人能休息", feedback: "你排出了第一张轮班表，疲惫的人终于敢睡一会儿。", scores: { survival: 1, social: 3, sanity: 1, chaos: 0 } },
      { text: "不接职务，继续巡查出入口", feedback: "你把注意力放回眼前，门口每个细节都没漏掉。", scores: { survival: 3, social: 0, sanity: 1, chaos: 0 } },
      { text: "接下电台麦克风，播报今日天气", feedback: "你认真播报了云量和风向，听众意外地不少。", scores: { survival: 0, social: 2, sanity: 0, chaos: 3 } }
    ]
  },
  {
    day: 12,
    scene: "有人在电台里发布未经证实的消息：救援队已经撤离。人群开始收拾行李，频道里一片嘈杂。",
    prompt: "你怎么做？",
    options: [
      { text: "暂停转发，先联系消息来源核实", feedback: "真相还没到，但混乱至少没再被扩音。", scores: { survival: 1, social: 0, sanity: 3, chaos: 0 } },
      { text: "向大家说明不确定性，建议暂缓离开", feedback: "人群慢慢停下，你把恐慌换成了一个等待决定。", scores: { survival: 1, social: 3, sanity: 2, chaos: 0 } },
      { text: "按最坏情况准备撤离路线和物资", feedback: "你没有轻信消息，也没有把风险当作不存在。", scores: { survival: 3, social: 0, sanity: 1, chaos: 0 } },
      { text: "把谣言改成更离谱的版本让大家冷静", feedback: "没人知道该不该笑，但所有人都暂停了收拾行李。", scores: { survival: 0, social: 1, sanity: 0, chaos: 3 } }
    ]
  },
  {
    day: 13,
    scene: "你在仓库发现一箱物资，标签显示属于另一支队伍。对方已经两天没有露面。",
    prompt: "你会怎么处理？",
    options: [
      { text: "登记物资，留下一半并发出寻找信息", feedback: "账本记录了每一件物资，也记录了你留下的那一半。", scores: { survival: 1, social: 3, sanity: 2, chaos: 0 } },
      { text: "先收起来，等确认对方是否平安", feedback: "物资暂时安全，你给后来核对留了余地。", scores: { survival: 2, social: 0, sanity: 2, chaos: 0 } },
      { text: "交由公共仓库统一分配", feedback: "物资有了去处，仓库门口也多了一份清晰的记录。", scores: { survival: 1, social: 2, sanity: 2, chaos: 0 } },
      { text: "在箱子旁留张纸条：先借用，谢了", feedback: "字条写得很礼貌，箱子也确实轻了不少。", scores: { survival: 2, social: -1, sanity: 0, chaos: 2 } }
    ]
  },
  {
    day: 14,
    scene: "远处传来连续三声信号弹。有人说那是救援，有人说是陷阱。夜色里看不清方向。",
    prompt: "你带大家怎么行动？",
    options: [
      { text: "先观察信号规律，再用无线电回应", feedback: "你们没有贸然暴露位置，回应也终于得到了回音。", scores: { survival: 2, social: 1, sanity: 3, chaos: 0 } },
      { text: "结伴前往，沿途留下清楚标记", feedback: "队伍彼此照应，回头的路也有了标记。", scores: { survival: 1, social: 3, sanity: 1, chaos: 0 } },
      { text: "留在有防护的地点，等天亮再说", feedback: "夜晚很长，但天亮时你们仍然完整地在一起。", scores: { survival: 3, social: 0, sanity: 1, chaos: 0 } },
      { text: "拿手电筒对着天空打摩斯电码 SOS", feedback: "你发出了超大号求救信号，顺便照亮了半条街。", scores: { survival: 0, social: 1, sanity: 0, chaos: 3 } }
    ]
  },
  {
    day: 15,
    scene: "第十五天，广播里终于传来清晰的救援坐标。你的队伍已经疲惫不堪，但每个人都还在。",
    prompt: "最后一步，你怎么选？",
    options: [
      { text: "检查队伍和物资，再按坐标出发", feedback: "你确认最后一次人数，带着大家朝信号的方向走去。", scores: { survival: 2, social: 1, sanity: 2, chaos: 0 } },
      { text: "先把坐标分享给附近所有幸存者", feedback: "频道里响起一声声回应，黑暗中多了许多同行的人。", scores: { survival: 0, social: 3, sanity: 1, chaos: 0 } },
      { text: "规划备用路线，留好撤退方案", feedback: "主路和退路都已记牢，你终于允许自己相信希望。", scores: { survival: 2, social: 0, sanity: 3, chaos: 0 } },
      { text: "先问救援队能不能顺路捎上你的盆栽", feedback: "电台那边沉默了两秒，然后传来一声忍不住的笑。", scores: { survival: 0, social: 1, sanity: 0, chaos: 3 } }
    ]
  }
];
