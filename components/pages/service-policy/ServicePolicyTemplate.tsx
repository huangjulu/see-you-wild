import Heading from "@/components/ui/atoms/Heading";
import Section from "@/components/ui/atoms/Section";

const ServicePolicyTemplate = () => {
  return (
    <main className="bg-page-gradient">
      <Section as="div" className="pt-24 pb-24">
        <article className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-3 space-y-12">
          <Heading.H1
            variant="display"
            overline="See You Wild"
            overlineClassName="my-2"
          >
            服務條款與退改政策
          </Heading.H1>

          <PolicySection title="一、報名與退改規則">
            <PolicySubSection title="個人因素取消">
              活動前 15 天以上（含）取消，將全額退款（僅扣除 NT$50
              行政手續費）。活動前 1-14
              天內取消恕不退款，但名額可自行轉讓給親友；為確保權益，轉讓請務必主動聯繫管家以利更換保險資料。
            </PolicySubSection>
            <PolicySubSection title="天候與不可抗力因素">
              如遇颱風、地震、豪大雨（含連續強降雨）等不可抗力因素，經團隊專業評估認為溪谷水位或環境具有安全疑慮（不限於官方警報發布），西揪團將主動取消活動。您可選擇全額退費（扣除
              NT$50 手續費）或將費用全額保留延期。
            </PolicySubSection>
            <PolicySubSection title="未達最低成團人數">
              若活動報名截止後未達最低成團人數，主辦方有權取消該次行程。您可選擇退款（扣除
              NT$50 行政手續費），或將費用全額保留至其他等值梯次。
            </PolicySubSection>
          </PolicySection>

          <PolicySection title="二、活動規範與權益">
            <PolicySubSection title="守時原則">
              為保障全體團員的體驗品質，活動將準時出發，逾時不候。若因個人遲到導致無法隨團出發，將視同自動放棄，恕不退費或改期。
            </PolicySubSection>
            <PolicySubSection title="飲食需求說明">
              我們將盡力在食材準備上配合大家的飲食習慣（如素食、過敏）。但考量戶外野炊與烹飪環境的限制，若無法完全滿足特殊客製化需求（如嚴格全素、特定過敏原排除），可能僅能提供方便素，或請您需自行準備部分餐點，敬請見諒。
            </PolicySubSection>
            <PolicySubSection title="裝備使用與財物保管">
              請愛惜借用之戶外裝備（如頭盔、防寒衣、救生衣等）。如因非正常操作或人為因素導致裝備損壞或遺失，參加者須照價賠償。個人貴重物品（如手機、相機、錢包）請自行保管或做好防水措施，若於活動過程中發生遺失、損壞或落水，西揪團不負賠償責任。
            </PolicySubSection>
          </PolicySection>

          <PolicySection title="三、風險聲明與責任歸屬">
            <PolicySubSection title="健康狀態聲明">
              患有心臟病、高血壓、氣喘、癲癇、懷孕或任何不宜受到過度刺激之疾病者，請勿報名。如因隱瞞病情導致意外發生，相關後果需由參加者自行承擔。
            </PolicySubSection>
            <PolicySubSection title="團隊指令與行程變更">
              戶外活動具有高度不確定性，教練與嚮導擁有活動期間之最高決策權。若遇氣候驟變、天災、地形地貌改變、野生動物侵擾等狀況，或任何經教練判斷足以影響團隊安全之因素，教練有權隨時變更行程、終止活動或執行撤退。學員須完全服從教練指令，不得異議。
            </PolicySubSection>
            <PolicySubSection title="責任免除同意">
              完成報名即代表您為完全民事行為能力人，充分理解戶外活動存在不可預測之風險（包括但不限於落石、滑倒、溺水等），並同意除本團隊故意疏失或重大過失外，自行承擔活動中之人身損害責任。
            </PolicySubSection>
          </PolicySection>

          <PolicySection title="四、隱私權與肖像權政策">
            <PolicySubSection title="個人資料保護">
              西揪團非常重視您的隱私權。我們於報名表單中所蒐集之個人資料（包含姓名、身分證字號、出生年月日、聯絡電話、電子郵件等），僅專用於「辦理活動旅遊平安保險」、「行前通知聯繫」及「緊急聯絡」之目的。我們承諾嚴格保密，絕不將您的個人資料外洩或提供給與活動無關之第三方機構。
            </PolicySubSection>
            <PolicySubSection title="肖像權使用聲明">
              本活動過程中將進行專業拍攝或錄影，影像僅用於西揪團之活動紀錄與品牌行銷宣傳（如官方網站、社群媒體）。若您不願入鏡或有特殊考量，請「務必」於活動前主動告知工作人員，我們將會避開拍攝或做馬賽克處理，完全尊重您的個人隱私。
            </PolicySubSection>
          </PolicySection>
        </article>
      </Section>
    </main>
  );
};

ServicePolicyTemplate.displayName = "ServicePolicyTemplate";
export default ServicePolicyTemplate;

// ── Sub-components (same-file, used only here) ──

interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
}

const PolicySection = (props: PolicySectionProps) => {
  return (
    <section className="space-y-6">
      <Heading.H2 variant="sub-heading">{props.title}</Heading.H2>
      <div className="space-y-6">{props.children}</div>
    </section>
  );
};

PolicySection.displayName = "PolicySection";

interface PolicySubSectionProps {
  title: string;
  children: React.ReactNode;
}

const PolicySubSection = (props: PolicySubSectionProps) => {
  return (
    <div className="space-y-2">
      <Heading.H3 variant="heading" className="text-lg">
        {props.title}
      </Heading.H3>
      <p className="typo-body text-secondary leading-relaxed">
        {props.children}
      </p>
    </div>
  );
};

PolicySubSection.displayName = "PolicySubSection";
