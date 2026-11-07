import { LightningElement, api, wire } from "lwc";
import { getRelatedListRecords } from "lightning/uiRelatedListApi";

const FIELDS = [
  "Inspection__c.Id",
  "Inspection__c.Name",
  "Inspection__c.Inspection_Date__c",
  "Inspection__c.Result__c",
  "Inspection__c.Certificate_URL__c"
];

const RESULT_CLASS = {
  Aprobado: "slds-badge slds-theme_success",
  Observado: "slds-badge slds-theme_warning",
  Rechazado: "slds-badge slds-theme_error"
};

/**
 * Historial de inspecciones de un equipo, con enlace al certificado.
 * Sin Apex: usa la UI API (respeta sharing y FLS), funciona en la página de
 * registro de Equipment__c y en la página de detalle del portal.
 */
export default class EquipmentInspections extends LightningElement {
  @api recordId;

  inspections = [];
  error;

  @wire(getRelatedListRecords, {
    parentRecordId: "$recordId",
    relatedListId: "Inspections__r",
    fields: FIELDS,
    sortBy: ["-Inspection__c.Inspection_Date__c"]
  })
  wiredInspections({ data, error }) {
    if (data) {
      this.inspections = data.records.map((r) => {
        const result = r.fields.Result__c.value;
        return {
          id: r.id,
          name: r.fields.Name.value,
          date: r.fields.Inspection_Date__c.value,
          result: result || "Sin resultado",
          badgeClass: RESULT_CLASS[result] || "slds-badge",
          certificateUrl: r.fields.Certificate_URL__c.value
        };
      });
      this.error = undefined;
    } else if (error) {
      this.inspections = [];
      this.error = "No se pudo cargar el historial de inspecciones.";
    }
  }

  get hasInspections() {
    return this.inspections.length > 0;
  }

  get title() {
    return `Inspecciones (${this.inspections.length})`;
  }
}
