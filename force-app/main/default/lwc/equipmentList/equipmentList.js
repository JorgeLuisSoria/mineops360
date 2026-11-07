import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import EQUIPMENT_OBJECT from "@salesforce/schema/Equipment__c";
import STATUS_FIELD from "@salesforce/schema/Equipment__c.Status__c";
import getEquipment from "@salesforce/apex/EquipmentController.getEquipment";

const ALL = "";

const COLUMNS = [
  { label: "Equipo", fieldName: "Name" },
  { label: "Categoría", fieldName: "Category__c" },
  { label: "Estado", fieldName: "Status__c" },
  { label: "Marca", fieldName: "Brand__c" },
  { label: "N° de serie", fieldName: "Serial_Number__c" },
  { label: "Ubicación", fieldName: "Location__c" },
  { label: "Cliente", fieldName: "accountName" },
  {
    type: "action",
    typeAttributes: { rowActions: [{ label: "Ver detalle", name: "view" }] }
  }
];

/**
 * Lista de equipos visibles para el usuario, con filtro por estado.
 * Sirve en la app interna (App/Home page) y en el portal de Experience Cloud:
 * el Apex consulta en USER_MODE, así cada cliente ve solo lo suyo.
 */
export default class EquipmentList extends NavigationMixin(LightningElement) {
  @api title = "Equipos";

  columns = COLUMNS;
  status = ALL;
  statusOptions = [{ label: "Todos", value: ALL }];
  rows = [];
  error;
  isLoading = true;

  @wire(getObjectInfo, { objectApiName: EQUIPMENT_OBJECT })
  objectInfo;

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: STATUS_FIELD
  })
  wiredStatuses({ data }) {
    if (data) {
      this.statusOptions = [
        { label: "Todos", value: ALL },
        ...data.values.map((v) => ({ label: v.label, value: v.value }))
      ];
    }
  }

  @wire(getEquipment, { status: "$status" })
  wiredEquipment({ data, error }) {
    if (data) {
      this.rows = data.map((e) => ({
        ...e,
        accountName: e.Account__r ? e.Account__r.Name : ""
      }));
      this.error = undefined;
      this.isLoading = false;
    } else if (error) {
      this.rows = [];
      this.error = error.body
        ? error.body.message
        : "No se pudieron cargar los equipos.";
      this.isLoading = false;
    }
  }

  get hasRows() {
    return this.rows.length > 0;
  }

  get isEmpty() {
    return !this.isLoading && !this.error && this.rows.length === 0;
  }

  handleStatusChange(event) {
    this.isLoading = true;
    this.status = event.detail.value;
  }

  handleRowAction(event) {
    if (event.detail.action.name === "view") {
      this[NavigationMixin.Navigate]({
        type: "standard__recordPage",
        attributes: {
          recordId: event.detail.row.Id,
          objectApiName: "Equipment__c",
          actionName: "view"
        }
      });
    }
  }
}
