import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

/**
 * Formulario para reportar una falla de equipo (crea un Case).
 * En la página de un equipo, el equipo viene precargado desde recordId.
 * Pensado para el portal del cliente minero y para la app interna.
 */
export default class ReportEquipmentIssue extends LightningElement {
  @api recordId;
  @api title = "Reportar una falla";

  createdCaseId;
  error;

  get equipmentId() {
    return this.recordId;
  }

  handleSuccess(event) {
    this.createdCaseId = event.detail.id;
    this.error = undefined;
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Caso creado",
        message: "Recibimos tu reporte. Un técnico se pondrá en contacto.",
        variant: "success"
      })
    );
    this.template.querySelectorAll("lightning-input-field").forEach((field) => {
      if (field.fieldName !== "Equipment__c") {
        field.reset();
      }
    });
  }

  handleError(event) {
    this.createdCaseId = undefined;
    this.error =
      event.detail && event.detail.message
        ? event.detail.message
        : "No se pudo crear el caso.";
  }
}
