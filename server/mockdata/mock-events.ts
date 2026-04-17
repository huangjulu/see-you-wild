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

const MOCK_EVENTS: MockEvent[] = [
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
  },
];

export { MOCK_EVENTS };
export type { MockEvent };
