/**
 * Tests de EquipmentController.
 * Corren como un usuario con el permission set MineOps_Internal_User, porque el
 * controlador consulta en USER_MODE y los campos nuevos no tienen FLS por perfil.
 */
@IsTest
private class EquipmentControllerTest {
  private static final String USERNAME = 'mineops.tester@mineops360.test';

  @TestSetup
  static void setup() {
    Profile standard = [
      SELECT Id
      FROM Profile
      WHERE Name = 'Standard User'
      LIMIT 1
    ];
    User tester = new User(
      Alias = 'mtest',
      Email = USERNAME,
      Username = USERNAME + '.' + Datetime.now().getTime(),
      LastName = 'Tester',
      ProfileId = standard.Id,
      TimeZoneSidKey = 'America/Lima',
      LocaleSidKey = 'es_PE',
      EmailEncodingKey = 'UTF-8',
      LanguageLocaleKey = 'es'
    );
    insert tester;

    PermissionSet ps = [
      SELECT Id
      FROM PermissionSet
      WHERE Name = 'MineOps_Internal_User'
      LIMIT 1
    ];
    insert new PermissionSetAssignment(
      AssigneeId = tester.Id,
      PermissionSetId = ps.Id
    );

    System.runAs(tester) {
      Account acc = new Account(Name = 'Minera Test');
      insert acc;
      insert new List<Equipment__c>{
        new Equipment__c(
          Name = 'Andamio Layher 01',
          Category__c = 'Andamio',
          Status__c = 'Disponible',
          Serial_Number__c = 'SN-001',
          Account__c = acc.Id
        ),
        new Equipment__c(
          Name = 'Grúa 02',
          Category__c = 'Izaje',
          Status__c = 'En Alquiler',
          Serial_Number__c = 'SN-002',
          Account__c = acc.Id
        ),
        new Equipment__c(
          Name = 'Generador 03',
          Category__c = 'Generador',
          Status__c = 'En Alquiler',
          Serial_Number__c = 'SN-003'
        )
      };
    }
  }

  private static User tester() {
    return [SELECT Id FROM User WHERE Email = :USERNAME LIMIT 1];
  }

  @IsTest
  static void returnsAllWhenStatusIsBlank() {
    List<Equipment__c> result;
    System.runAs(tester()) {
      Test.startTest();
      result = EquipmentController.getEquipment(null);
      Test.stopTest();
    }
    Assert.areEqual(3, result.size(), 'Sin filtro debe devolver los 3 equipos');
    Assert.areEqual(
      'Andamio Layher 01',
      result[0].Name,
      'Debe ordenar por nombre'
    );
  }

  @IsTest
  static void filtersByStatus() {
    List<Equipment__c> result;
    System.runAs(tester()) {
      Test.startTest();
      result = EquipmentController.getEquipment('En Alquiler');
      Test.stopTest();
    }
    Assert.areEqual(
      2,
      result.size(),
      'Debe devolver solo los equipos en alquiler'
    );
    for (Equipment__c e : result) {
      Assert.areEqual(
        'En Alquiler',
        e.Status__c,
        'Todos deben estar en alquiler'
      );
    }
  }

  @IsTest
  static void returnsEmptyForStatusWithoutRecords() {
    List<Equipment__c> result;
    System.runAs(tester()) {
      Test.startTest();
      result = EquipmentController.getEquipment('Fuera de Servicio');
      Test.stopTest();
    }
    Assert.isTrue(result.isEmpty(), 'No hay equipos fuera de servicio');
  }
}
