/**
 * Controlador para los LWC de equipos (app interna y portal Experience Cloud).
 * Las consultas corren en USER_MODE: respetan sharing, CRUD y FLS del usuario,
 * así un cliente del portal solo ve los equipos de su propia empresa.
 */
public with sharing class EquipmentController {
  private static final Integer MAX_ROWS = 200;

  /**
   * Devuelve los equipos visibles para el usuario actual.
   * @param status Valor de Status__c para filtrar; vacío devuelve todos.
   * @return Lista de equipos ordenada por nombre (máximo 200).
   */
  @AuraEnabled(cacheable=true)
  public static List<Equipment__c> getEquipment(String status) {
    if (String.isBlank(status)) {
      return [
        SELECT
          Id,
          Name,
          Category__c,
          Brand__c,
          Status__c,
          Serial_Number__c,
          Location__c,
          Account__r.Name
        FROM Equipment__c
        WITH USER_MODE
        ORDER BY Name
        LIMIT :MAX_ROWS
      ];
    }
    return [
      SELECT
        Id,
        Name,
        Category__c,
        Brand__c,
        Status__c,
        Serial_Number__c,
        Location__c,
        Account__r.Name
      FROM Equipment__c
      WHERE Status__c = :status
      WITH USER_MODE
      ORDER BY Name
      LIMIT :MAX_ROWS
    ];
  }
}
