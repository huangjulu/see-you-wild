import type { EventRow } from "@/lib/types/database";

type MockEvent = Pick<
  EventRow,
  | "id"
  | "type"
  | "location"
  | "title"
  | "start_date"
  | "end_date"
  | "base_price"
  | "status"
> & {
  image: string;
  imageAlt: string;
};

export type MockEventDetail = MockEvent & {
  description: string;
  safetyPolicy: string;
  images: Array<{ src: string; alt: string }>;
  availableDates: string[];
  pickupLocations: string[];
  carpoolSurcharge: number;
};

const MOCK_EVENTS: MockEventDetail[] = [
  {
    id: "camping-chef-alishan-202605",
    type: "camping",
    location: "阿里山",
    title: "野營私廚｜阿里山秘境",
    start_date: "2026-05-18",
    end_date: "2026-05-19",
    base_price: 4800,
    status: "open",
    image:
      "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=600&q=80",
    imageAlt: "阿里山星空下的野營私廚場景",
    description:
      "探尋阿里山的神秘秘境，在海拔 2000 公尺的高度感受山林的寧靜與壯麗。我們精選了阿里山最隱藏的野營地點，配合專業私廚團隊為您獻上山居美食。夜幕降臨後，星空璀璨，是攝影愛好者的天堂。\n\n此行程適合所有戶外愛好者，無需過往露營經驗。我們提供完整的帳篷、睡袋及保暖用具，讓您專注於享受大自然的懷抱。漫步在檜木步道上，呼吸帶著檜木香氣的清晨空氣，體驗遠離塵囂的山林靜謐。\n\n特別安排了當地食材料理，品嚐山上新鮮蔬菜與精選山產。營火晚宴時，聽著林間蟲鳴，享受美食與星空的雙重盛宴。",
    safetyPolicy:
      "參與者需年滿 12 歲，未成年人須由成人陪同。行程需步行 2 小時以上，請穿著適合登山的鞋類與服裝。高山環境氣候變化快速，請自備防曬、防風夾克與雨具。\n\n露營營地內禁止吸菸與使用明火（私廚區域除外）。夜間請勿單獨離開營地，保管好個人物品。參與者需簽署安全同意書，若有高山症史或心血管疾病應事先告知。",
    images: [
      {
        src: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=600&q=80",
        alt: "阿里山星空下的野營私廚場景",
      },
      {
        src: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80",
        alt: "星空下的營火晚宴",
      },
      {
        src: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80",
        alt: "阿里山森林步道風景",
      },
      {
        src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
        alt: "帳篷內部舒適空間",
      },
    ],
    availableDates: ["2026-05-18", "2026-05-25", "2026-06-08"],
    pickupLocations: ["台北車站", "板橋車站", "桃園高鐵站", "台中高鐵站"],
    carpoolSurcharge: 450,
  },
  {
    id: "hot-spring-lisong-202606",
    type: "hot-spring",
    location: "栗松溫泉",
    title: "野溪溫泉｜栗松秘境",
    start_date: "2026-06-01",
    end_date: "2026-06-02",
    base_price: 3600,
    status: "open",
    image:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80",
    imageAlt: "栗松溫泉的碧綠溪水與岩壁",
    description:
      "栗松溫泉素有「台灣最美野溪溫泉」之稱，碧綠的溪水與白色的溫泉交匯，形成獨特的自然奇景。沿著陡峭的山壁而下，親身體驗探險的刺激感。\n\n溫泉池的溫度自然調節，最適宜的泡湯溫度約 40-45°C，是天然的舒適環境。周圍被翠綠的原始森林包圍，靜寂中只聞流水聲與鳥鳴，彷彿進入了世外桃源。\n\n行程包含專業導遊帶領、安全繩索設置及簡單沐浴設施。傍晚時分在溫泉池畔用餐，享受溫泉包圍的山野美食體驗。",
    safetyPolicy:
      "需要具備基本登山體能，路段部分陡峭且需攀爬。必須穿著登山鞋與防滑裝備。孕婦、心臟病患及高血壓者不宜參與。泡湯時間建議不超過 30 分鐘，過程中保持水分補充。\n\n禁止單獨進入溫泉區，務必跟隨導遊指示。溪水流速快速，請勿靠近主流區域。過往有滑倒事故，請在專業引導下進出溫泉池。",
    images: [
      {
        src: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80",
        alt: "栗松溫泉的碧綠溪水與岩壁",
      },
      {
        src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
        alt: "溪邊溫泉池泡湯體驗",
      },
      {
        src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
        alt: "峽谷林間路徑",
      },
      {
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
        alt: "天然溫泉景觀",
      },
    ],
    availableDates: ["2026-06-01", "2026-06-15", "2026-07-01", "2026-07-15"],
    pickupLocations: ["台北車站", "新竹高鐵站", "台中高鐵站", "台南高鐵站"],
    carpoolSurcharge: 380,
  },
  {
    id: "sup-sunrise-hualien-202606",
    type: "sup",
    location: "花蓮鯉魚潭",
    title: "SUP 日出團｜鯉魚潭",
    start_date: "2026-06-15",
    end_date: "2026-06-15",
    base_price: 2800,
    status: "open",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    imageAlt: "花蓮鯉魚潭上的 SUP 立槳日出",
    description:
      "在花蓮鯉魚潭的日出時刻踏上立槳板，親歷晨曦下的湖面寧靜。鯉魚潭是台灣最大的內陸淡水湖，清澈的湖水映照著周圍山景與初升的太陽。\n\n行程從凌晨 5 時開始，導師會提供基礎教學確保安全，適合初學者參與。隨著太陽升起，湖面由深藍轉為金黃，此刻拍攝的照片格外動人。\n\n結束後於湖邊享用簡單早餐，感受花蓮山水的溫暖。若天氣晴朗，可見中央山脈的壯麗輪廓。",
    safetyPolicy:
      "參加者需具備基本游泳能力，著救生衣進行。禁止單獨站立超過 1 分鐘，務必跟隨教練指示保持穩定姿態。孕婦及 6 歲以下兒童不宜參與。\n\n惡劣天氣（風速超過 12 級）將取消行程。請提前告知過敏症狀或舊傷情況。禁止攜帶尖銳物品上板，保管好手機與相機。",
    images: [
      {
        src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
        alt: "花蓮鯉魚潭上的 SUP 立槳日出",
      },
      {
        src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
        alt: "SUP 立槳湖面體驗",
      },
      {
        src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
        alt: "晨曦下的湖景",
      },
      {
        src: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600&q=80",
        alt: "SUP 教練指導",
      },
    ],
    availableDates: ["2026-06-15", "2026-06-22", "2026-07-06"],
    pickupLocations: ["板橋車站", "台北車站", "桃園高鐵站", "台中高鐵站"],
    carpoolSurcharge: 320,
  },
  {
    id: "tree-climbing-nantou-202607",
    type: "tree-climbing",
    location: "南投杉林溪",
    title: "攀樹體驗｜杉林溪森林浴",
    start_date: "2026-07-05",
    end_date: "2026-07-06",
    base_price: 3200,
    status: "open",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
    imageAlt: "杉林溪綠意盎然的森林攀樹體驗",
    description:
      "體驗攀樹的獨特冒險，在杉林溪的原始森林中探索樹冠層的世界。杉林溪擁有超過百年樹齡的老杉樹，攀樹過程中能親密接觸大自然，感受樹木的生命力。\n\n我們使用最新安全設備與技術繩索，讓每位參與者在充分保障下享受攀樹的刺激與樂趣。高度達 15-20 公尺，在樹頂眺望森林全景，視野遼闊。\n\n行程包含專業攀樹師的完整指導、森林導覽解說，認識杉林溪的生態與植物特色。傍晚享受森林浴，身心放鬆。",
    safetyPolicy:
      "年齡 8-70 歲皆可參與，但需具備基本體能與心理準備。患有懼高症、心血管疾病或孕婦應事先告知或不參與。全程配備安全帶、頭盔與防護手套。\n\n攀樹過程中務必遵循指導員指示，禁止自行調整安全繩索。如感到不適應隨時告知，可立即返回地面。下雨天或風速超過 10 級將取消或延期行程。",
    images: [
      {
        src: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
        alt: "杉林溪綠意盎然的森林攀樹體驗",
      },
      {
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
        alt: "樹頂眺望森林全景",
      },
      {
        src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
        alt: "杉林溪森林路徑",
      },
      {
        src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
        alt: "攀樹安全設備",
      },
    ],
    availableDates: ["2026-07-05", "2026-07-19", "2026-08-02"],
    pickupLocations: ["台中高鐵站", "台北車站", "板橋車站", "新竹高鐵站"],
    carpoolSurcharge: 400,
  },
  {
    id: "river-tracing-hualien-202607",
    type: "river-tracing",
    location: "花蓮三棧溪",
    title: "溯溪探險｜三棧南溪",
    start_date: "2026-07-12",
    end_date: "2026-07-12",
    base_price: 2500,
    status: "open",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
    imageAlt: "花蓮三棧溪的清澈溪水與峽谷",
    description:
      "花蓮三棧溪是溯溪愛好者的聖地，清澈的溪水、壯麗的峽谷與天然瀑布構成了迷人的景觀。此行程設計為全天探險，沿著溪谷上溯，克服各式天然障礙與天然滑水道。\n\n中途經過多個跳水點，深度與難度適合各程度愛好者。教練會在關鍵位置協助與指導，確保安全的前提下享受冒險的快感。溪水清涼，在炎熱的七月是天然的冷卻體驗。\n\n行程中會在隱秘的峽谷小平台享用簡單午餐，聆聽山間的迴音與流水聲。下午返程前，在清澈的深潭中暢游，洗淨一身疲勞。",
    safetyPolicy:
      "參與者需年滿 12 歲，未成年人須由成人陪同。需具備中等游泳能力與膽識。全程配備救生衣、頭盔與防滑鞋。禁止佩戴眼鏡與假牙，需摘除。\n\n溪流環境變化快速，雨後 48 小時內水流湍急，將取消或延期行程。參與者需簽署風險同意書。在指導員未確認安全前，禁止單獨跳水或攀爬。如感到不適應隨時告知，可原路返回。",
    images: [
      {
        src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
        alt: "花蓮三棧溪的清澈溪水與峽谷",
      },
      {
        src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
        alt: "溪谷瀑布與清潭",
      },
      {
        src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
        alt: "峽谷林間環境",
      },
      {
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
        alt: "跳水與遊泳點",
      },
    ],
    availableDates: ["2026-07-12", "2026-07-26", "2026-08-09"],
    pickupLocations: ["台北車站", "板橋車站", "新竹高鐵站", "台中高鐵站"],
    carpoolSurcharge: 350,
  },
  {
    id: "camping-chef-wuling-202608",
    type: "camping",
    location: "武陵農場",
    title: "野營私廚｜武陵星空",
    start_date: "2026-08-10",
    end_date: "2026-08-11",
    base_price: 5200,
    status: "open",
    image:
      "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&q=80",
    imageAlt: "武陵農場的高山野營場景",
    description:
      "武陵農場位於海拔 1500 多公尺，是台灣高山露營的絕佳地點。三面環山，空氣清新，夜間星空璀璨，是天文愛好者與攝影師的最愛。我們精選農場內最佳露營區域，搭建帳篷享受高山生活。\n\n行程特別邀請高山美食主廚現地創作，利用武陵農場新鮮的高山蔬菜與特選食材。營火晚餐在星空下進行，搭配高山茶香與山野風味，創造難忘的味覺記憶。\n\n翌日清晨登上制高點欣賞日出，看著陽光逐漸灑落谷地，山景層疊疊現。午餐後返程，帶走的是高山的寧靜與滿心的充實感。",
    safetyPolicy:
      "參與者需年滿 14 歲。因海拔較高，建議參與者提前一週開始進行有氧運動準備。患有嚴重心血管疾病、嚴重高血壓或高山症史者不宜參與。\n\n武陵農場內禁止生火（私廚區域除外），違者罰款與驅逐。夜間溫度可跌至 10°C 以下，請自備保暖衣物。禁止獨自離開營地，特別是夜間。高山天氣變化快速，請隨時備妥雨具與防風衣。",
    images: [
      {
        src: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&q=80",
        alt: "武陵農場的高山野營場景",
      },
      {
        src: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80",
        alt: "高山星空營火晚餐",
      },
      {
        src: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80",
        alt: "武陵農場山景",
      },
      {
        src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
        alt: "高山蔬菜美食",
      },
      {
        src: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600&q=80",
        alt: "清晨日出風景",
      },
    ],
    availableDates: ["2026-08-10", "2026-08-24", "2026-09-07"],
    pickupLocations: ["台北車站", "板橋車站", "桃園高鐵站", "台中高鐵站"],
    carpoolSurcharge: 500,
  },
  {
    id: "hot-spring-taitung-202608",
    type: "hot-spring",
    location: "台東紅葉溫泉",
    title: "野溪溫泉｜紅葉秘境",
    start_date: "2026-08-22",
    end_date: "2026-08-23",
    base_price: 3800,
    status: "closed",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    imageAlt: "台東紅葉溫泉的天然岩池",
    description:
      "台東紅葉溫泉位於知本溪上游，以天然岩池與紅褐色山壁而聞名。泉質含礦物質豐富，泡湯時能感受到溫泉對肌膚的滋養效果。溫泉池水溫自然調節在 45°C 左右，是最舒適的泡湯溫度。\n\n周圍被濃密的原始林包圍，靜寂只被山風與流水聲填滿。這裡遠離商業溫泉區，保留著最純粹的野溪溫泉風味。行程包含當地特色風味餐點，品嚐台東在地食材的美味。\n\n傍晚時分，天色漸暗，星空開始點綴山谷，此時在溫泉池中泡湯，彷彿與天地融為一體。隔日清晨，聽著晨鳥鳴唱，再享受一次溫暖泉水的擁抱。",
    safetyPolicy:
      "需具備中等登山體能，路段陡峭且需攀爬。必須穿著登山鞋與防滑裝備。心臟病患、高血壓者與孕婦不宜參與。泡湯時間建議不超過 30 分鐘，請保持水分補充。\n\n禁止單獨進入溫泉區，務必跟隨導遊指示。溪流流速快速，請勿靠近主流區域。禁止攜帶瓶罐於溫泉池內，保護環境。下雨天或水位過高將取消行程。",
    images: [
      {
        src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
        alt: "台東紅葉溫泉的天然岩池",
      },
      {
        src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
        alt: "野溪溫泉岩壁景觀",
      },
      {
        src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
        alt: "紅葉溪谷路徑",
      },
      {
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
        alt: "天然溫泉池",
      },
    ],
    availableDates: ["2026-08-22", "2026-09-05", "2026-09-19"],
    pickupLocations: ["台北車站", "新竹高鐵站", "台中高鐵站", "左營高鐵站"],
    carpoolSurcharge: 520,
  },
  {
    id: "sup-sunset-penghu-202609",
    type: "sup",
    location: "澎湖",
    title: "SUP 夕陽團｜澎湖藍洞",
    start_date: "2026-09-06",
    end_date: "2026-09-07",
    base_price: 4500,
    status: "open",
    image:
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
    imageAlt: "澎湖碧藍海面上的 SUP 夕陽體驗",
    description:
      "澎湖藍洞是台灣最神秘的海蝕洞，只能透過 SUP 立槳進入。入洞時，陽光從海面透射進來，將洞內海水染成深邃的藍色，彷彿進入另一個世界。此行程特別設計在日落時分進行，夕陽的橙紅色與藍洞的深藍色對比，是攝影愛好者的必拍景點。\n\n澎湖的海水清澈見底，站在立槳板上能清楚看見海底的海草與小魚。導師會帶領穿過險峻的岩石與狹窄的水道，整個探險過程既刺激又安全。\n\n行程包含島嶼週邊浮潛、海邊簡餐與住宿。傍晚在民宿享受澎湖海鮮大餐，品嚐漁夫新鮮捕獲的當日漁獲。",
    safetyPolicy:
      "參加者需具備基本游泳能力，著救生衣與頭盔進行。禁止單獨划行，務必跟隨教練隊伍。年齡限制 10-65 歲。孕婦與重度恐水症患者不宜參與。\n\n澎湖海域潮汐與浪況變化快速，如浪高超過 1.5 公尺將取消或延期行程。藍洞入口狹窄且流速快速，禁止自行嘗試。過程中如感到不適應應立即告知教練。所有參與者需簽署安全同意書。",
    images: [
      {
        src: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
        alt: "澎湖碧藍海面上的 SUP 夕陽體驗",
      },
      {
        src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
        alt: "藍洞內的深邃藍色",
      },
      {
        src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
        alt: "澎湖海景與島嶼",
      },
      {
        src: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600&q=80",
        alt: "日落時分的海上 SUP",
      },
    ],
    availableDates: ["2026-09-06", "2026-09-13", "2026-09-20", "2026-10-04"],
    pickupLocations: ["台北車站", "台中高鐵站", "左營高鐵站", "高雄車站"],
    carpoolSurcharge: 600,
  },
];

export { MOCK_EVENTS };
export type { MockEvent };
