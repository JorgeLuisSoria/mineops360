// En tests, el adapter mock se usa directo (emit) y no vía @wire.
/* eslint-disable @lwc/lwc/no-unexpected-wire-adapter-usages */
import { createElement } from "@lwc/engine-dom";
import EquipmentInspections from "c/equipmentInspections";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";

const record = (id, name, date, result, url) => ({
  id,
  fields: {
    Name: { value: name },
    Inspection_Date__c: { value: date },
    Result__c: { value: result },
    Certificate_URL__c: { value: url }
  }
});

const flush = () => Promise.resolve();

describe("c-equipment-inspections", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function mount() {
    const el = createElement("c-equipment-inspections", {
      is: EquipmentInspections
    });
    el.recordId = "a01000000000001AAA";
    document.body.appendChild(el);
    return el;
  }

  it("lista las inspecciones con su resultado y certificado", async () => {
    const el = mount();
    getRelatedListRecords.emit({
      records: [
        record(
          "a02000000000001AAA",
          "INS-0002",
          "2026-10-01",
          "Aprobado",
          "https://example.com/cert.pdf"
        ),
        record("a02000000000002AAA", "INS-0001", "2026-06-01", null, null)
      ]
    });
    await flush();

    const items = el.shadowRoot.querySelectorAll('[data-id="inspection"]');
    expect(items).toHaveLength(2);
    expect(
      el.shadowRoot.querySelectorAll("lightning-formatted-url")
    ).toHaveLength(1);
    expect(items[1].textContent).toContain("Sin resultado");
  });

  it("muestra el estado vacío", async () => {
    const el = mount();
    getRelatedListRecords.emit({ records: [] });
    await flush();

    expect(el.shadowRoot.querySelector('[data-id="empty"]')).not.toBeNull();
  });
});
