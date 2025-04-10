import { Accordion, AccordionItem } from "@/components/accordion";
import { FormattedMessage } from "react-intl";

const MiscFaq = () => {
  const items = [
    {
      titleKey: "FAQ.FEATURES_TITLE",
      textKey: "FAQ.FEATURES_TEXT",
    },
    {
      titleKey: "FAQ.OCR_TITLE",
      textKey: "FAQ.OCR_TEXT",
    },
    {
      titleKey: "FAQ.PLAN_CHANGE_TITLE",
      textKey: "FAQ.PLAN_CHANGE_TEXT",
    },
    {
      titleKey: "FAQ.PAYMENT_TITLE",
      textKey: "FAQ.PAYMENT_TEXT",
    },
    {
      titleKey: "FAQ.EXPENSE_LIMIT_TITLE",
      textKey: "FAQ.EXPENSE_LIMIT_TEXT",
    },
    {
      titleKey: "FAQ.DATA_PROTECTION_TITLE",
      textKey: "FAQ.DATA_PROTECTION_TEXT",
    },
  ];

  const generateItems = () => {
    return (
      <Accordion allowMultiple={false}>
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            title={<FormattedMessage id={item.titleKey} />}
          >
            <FormattedMessage id={item.textKey} />
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <FormattedMessage id="FAQ.TITLE" />
        </h3>
      </div>
      <div className="card-body py-3">{generateItems()}</div>
    </div>
  );
};

export { MiscFaq };
