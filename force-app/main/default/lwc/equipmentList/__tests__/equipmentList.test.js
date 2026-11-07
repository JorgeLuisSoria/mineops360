import { createElement } from "@lwc/engine-dom";
import EquipmentList from "c/equipmentList";
import getEquipment from "@salesforce/apex/EquipmentController.getEquipment";

jest.mock(
  "@salesforce/apex/EquipmentController.getEquipment",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return { default: createApexTestWireAdapter(jest.fn()) };
  },
  { virtual: true }
);

const EQUIPMENT = [
  {
    Id: "a01000000000001AAA",
    Name: "Andamio Layher 01",
    Category__c: "Andamio",
    Status__c: "Disponible",
    Account__r: { Name: "Minera Test" }
  },
  {
    Id: "a01000000000002AAA",
    Name: "Generador 03",
    Category__c: "Generador",
    Status__c: "En Alquiler"
  }
];

const flush = () => Promise.resolve();

describe("c-equipment-list", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  function mount() {
    const el = createElement("c-equipment-list", { is: EquipmentList });
    document.body.appendChild(el);
    return el;
  }

  it("muestra la tabla con los equipos y el nombre del cliente", async () => {
    const el = mount();
    getEquipment.emit(EQUIPMENT);
    await flush();

    const table = el.shadowRoot.querySelector("lightning-datatable");
    expect(table).not.toBeNull();
    expect(table.data).toHaveLength(2);
    expect(table.data[0].accountName).toBe("Minera Test");
    expect(table.data[1].accountName).toBe("");
  });

  it("muestra un mensaje cuando no hay equipos", async () => {
    const el = mount();
    getEquipment.emit([]);
    await flush();

    expect(el.shadowRoot.querySelector("lightning-datatable")).toBeNull();
    expect(el.shadowRoot.querySelector('[data-id="empty"]')).not.toBeNull();
  });

  it("muestra el error del servidor", async () => {
    const el = mount();
    getEquipment.error({ message: "Sin acceso" });
    await flush();

    const error = el.shadowRoot.querySelector('[data-id="error"]');
    expect(error.textContent).toBe("Sin acceso");
  });
});
