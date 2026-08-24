// Realistic BPMN 2.0 models for representative L3 process nodes.
// Each key maps a ProcessElement.id to its BPMN XML string.

const createPurchaseRequisition = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_PR">
  <bpmn:process id="Process_PR" name="Create Purchase Requisition" isExecutable="false">
    <bpmn:startEvent id="SE_1" name="PR&#10;Requested">
      <bpmn:outgoing>SF_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="T_1" name="Check Inventory Availability">
      <bpmn:incoming>SF_1</bpmn:incoming>
      <bpmn:outgoing>SF_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="GW_1" name="Stock Available?">
      <bpmn:incoming>SF_2</bpmn:incoming>
      <bpmn:outgoing>SF_3</bpmn:outgoing>
      <bpmn:outgoing>SF_4</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="T_2" name="Create PR from Existing Stock">
      <bpmn:incoming>SF_3</bpmn:incoming>
      <bpmn:outgoing>SF_5</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="T_3" name="Create New Purchase Requisition">
      <bpmn:incoming>SF_4</bpmn:incoming>
      <bpmn:outgoing>SF_6</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="GW_2">
      <bpmn:incoming>SF_5</bpmn:incoming>
      <bpmn:incoming>SF_6</bpmn:incoming>
      <bpmn:outgoing>SF_7</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="T_4" name="Submit PR for Approval">
      <bpmn:incoming>SF_7</bpmn:incoming>
      <bpmn:outgoing>SF_8</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="GW_3" name="Above Approval Threshold?">
      <bpmn:incoming>SF_8</bpmn:incoming>
      <bpmn:outgoing>SF_9</bpmn:outgoing>
      <bpmn:outgoing>SF_10</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="T_5" name="Manager Reviews and Approves PR">
      <bpmn:incoming>SF_9</bpmn:incoming>
      <bpmn:outgoing>SF_11</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="GW_4">
      <bpmn:incoming>SF_10</bpmn:incoming>
      <bpmn:incoming>SF_11</bpmn:incoming>
      <bpmn:outgoing>SF_12</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="T_6" name="Create PR in ERP System">
      <bpmn:incoming>SF_12</bpmn:incoming>
      <bpmn:outgoing>SF_13</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="EE_1" name="PR&#10;Created">
      <bpmn:incoming>SF_13</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SF_1" sourceRef="SE_1" targetRef="T_1" />
    <bpmn:sequenceFlow id="SF_2" sourceRef="T_1" targetRef="GW_1" />
    <bpmn:sequenceFlow id="SF_3" name="Yes" sourceRef="GW_1" targetRef="T_2" />
    <bpmn:sequenceFlow id="SF_4" name="No" sourceRef="GW_1" targetRef="T_3" />
    <bpmn:sequenceFlow id="SF_5" sourceRef="T_2" targetRef="GW_2" />
    <bpmn:sequenceFlow id="SF_6" sourceRef="T_3" targetRef="GW_2" />
    <bpmn:sequenceFlow id="SF_7" sourceRef="GW_2" targetRef="T_4" />
    <bpmn:sequenceFlow id="SF_8" sourceRef="T_4" targetRef="GW_3" />
    <bpmn:sequenceFlow id="SF_9" name="Yes" sourceRef="GW_3" targetRef="T_5" />
    <bpmn:sequenceFlow id="SF_10" name="No" sourceRef="GW_3" targetRef="GW_4" />
    <bpmn:sequenceFlow id="SF_11" sourceRef="T_5" targetRef="GW_4" />
    <bpmn:sequenceFlow id="SF_12" sourceRef="GW_4" targetRef="T_6" />
    <bpmn:sequenceFlow id="SF_13" sourceRef="T_6" targetRef="EE_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_PR">
      <bpmndi:BPMNShape id="SE_1_di" bpmnElement="SE_1">
        <dc:Bounds x="152" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="140" y="275" width="60" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_1_di" bpmnElement="T_1">
        <dc:Bounds x="250" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_1_di" bpmnElement="GW_1" isMarkerVisible="true">
        <dc:Bounds x="455" y="225" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="440" y="195" width="80" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_2_di" bpmnElement="T_2">
        <dc:Bounds x="570" y="130" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_3_di" bpmnElement="T_3">
        <dc:Bounds x="570" y="300" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_2_di" bpmnElement="GW_2" isMarkerVisible="true">
        <dc:Bounds x="765" y="225" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_4_di" bpmnElement="T_4">
        <dc:Bounds x="880" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_3_di" bpmnElement="GW_3" isMarkerVisible="true">
        <dc:Bounds x="1095" y="225" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="1075" y="195" width="90" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_5_di" bpmnElement="T_5">
        <dc:Bounds x="1210" y="130" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_4_di" bpmnElement="GW_4" isMarkerVisible="true">
        <dc:Bounds x="1405" y="225" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_6_di" bpmnElement="T_6">
        <dc:Bounds x="1520" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EE_1_di" bpmnElement="EE_1">
        <dc:Bounds x="1702" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1690" y="275" width="60" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SF_1_di" bpmnElement="SF_1">
        <di:waypoint x="188" y="250" /><di:waypoint x="250" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_2_di" bpmnElement="SF_2">
        <di:waypoint x="370" y="250" /><di:waypoint x="455" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_3_di" bpmnElement="SF_3">
        <di:waypoint x="480" y="225" /><di:waypoint x="480" y="170" /><di:waypoint x="570" y="170" />
        <bpmndi:BPMNLabel><dc:Bounds x="488" y="193" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_4_di" bpmnElement="SF_4">
        <di:waypoint x="480" y="275" /><di:waypoint x="480" y="340" /><di:waypoint x="570" y="340" />
        <bpmndi:BPMNLabel><dc:Bounds x="488" y="303" width="15" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_5_di" bpmnElement="SF_5">
        <di:waypoint x="690" y="170" /><di:waypoint x="790" y="170" /><di:waypoint x="790" y="225" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_6_di" bpmnElement="SF_6">
        <di:waypoint x="690" y="340" /><di:waypoint x="790" y="340" /><di:waypoint x="790" y="275" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_7_di" bpmnElement="SF_7">
        <di:waypoint x="815" y="250" /><di:waypoint x="880" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_8_di" bpmnElement="SF_8">
        <di:waypoint x="1000" y="250" /><di:waypoint x="1095" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_9_di" bpmnElement="SF_9">
        <di:waypoint x="1120" y="225" /><di:waypoint x="1120" y="170" /><di:waypoint x="1210" y="170" />
        <bpmndi:BPMNLabel><dc:Bounds x="1128" y="193" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_10_di" bpmnElement="SF_10">
        <di:waypoint x="1145" y="250" /><di:waypoint x="1405" y="250" />
        <bpmndi:BPMNLabel><dc:Bounds x="1268" y="232" width="15" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_11_di" bpmnElement="SF_11">
        <di:waypoint x="1330" y="170" /><di:waypoint x="1430" y="170" /><di:waypoint x="1430" y="225" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_12_di" bpmnElement="SF_12">
        <di:waypoint x="1455" y="250" /><di:waypoint x="1520" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_13_di" bpmnElement="SF_13">
        <di:waypoint x="1640" y="250" /><di:waypoint x="1702" y="250" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const negotiateAndAwardContract = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_Contract">
  <bpmn:process id="Process_Contract" name="Negotiate and Award Contract" isExecutable="false">
    <bpmn:startEvent id="SE_1" name="Sourcing&#10;Need Identified">
      <bpmn:outgoing>SF_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="T_1" name="Define Sourcing Requirements">
      <bpmn:incoming>SF_1</bpmn:incoming>
      <bpmn:outgoing>SF_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="T_2" name="Issue RFQ to Qualified Suppliers">
      <bpmn:incoming>SF_2</bpmn:incoming>
      <bpmn:outgoing>SF_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:subProcess id="SP_1" name="Evaluate Supplier Bids" triggeredByEvent="false">
      <bpmn:incoming>SF_3</bpmn:incoming>
      <bpmn:outgoing>SF_4</bpmn:outgoing>
    </bpmn:subProcess>
    <bpmn:exclusiveGateway id="GW_1" name="Bid Acceptable?">
      <bpmn:incoming>SF_4</bpmn:incoming>
      <bpmn:outgoing>SF_5</bpmn:outgoing>
      <bpmn:outgoing>SF_6</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="T_3" name="Negotiate Contract Terms with Supplier">
      <bpmn:incoming>SF_5</bpmn:incoming>
      <bpmn:outgoing>SF_7</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="T_4" name="Award Contract to Preferred Supplier">
      <bpmn:incoming>SF_6</bpmn:incoming>
      <bpmn:outgoing>SF_8</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="GW_2">
      <bpmn:incoming>SF_7</bpmn:incoming>
      <bpmn:incoming>SF_8</bpmn:incoming>
      <bpmn:outgoing>SF_9</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="T_5" name="Draft and Sign Contract">
      <bpmn:incoming>SF_9</bpmn:incoming>
      <bpmn:outgoing>SF_10</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="T_6" name="Notify Unsuccessful Bidders">
      <bpmn:incoming>SF_10</bpmn:incoming>
      <bpmn:outgoing>SF_11</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="EE_1" name="Contract&#10;Awarded">
      <bpmn:incoming>SF_11</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SF_1" sourceRef="SE_1" targetRef="T_1" />
    <bpmn:sequenceFlow id="SF_2" sourceRef="T_1" targetRef="T_2" />
    <bpmn:sequenceFlow id="SF_3" sourceRef="T_2" targetRef="SP_1" />
    <bpmn:sequenceFlow id="SF_4" sourceRef="SP_1" targetRef="GW_1" />
    <bpmn:sequenceFlow id="SF_5" name="No" sourceRef="GW_1" targetRef="T_3" />
    <bpmn:sequenceFlow id="SF_6" name="Yes" sourceRef="GW_1" targetRef="T_4" />
    <bpmn:sequenceFlow id="SF_7" sourceRef="T_3" targetRef="GW_2" />
    <bpmn:sequenceFlow id="SF_8" sourceRef="T_4" targetRef="GW_2" />
    <bpmn:sequenceFlow id="SF_9" sourceRef="GW_2" targetRef="T_5" />
    <bpmn:sequenceFlow id="SF_10" sourceRef="T_5" targetRef="T_6" />
    <bpmn:sequenceFlow id="SF_11" sourceRef="T_6" targetRef="EE_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_Contract">
      <bpmndi:BPMNShape id="SE_1_di" bpmnElement="SE_1">
        <dc:Bounds x="152" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="130" y="275" width="80" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_1_di" bpmnElement="T_1">
        <dc:Bounds x="250" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_2_di" bpmnElement="T_2">
        <dc:Bounds x="430" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP_1_di" bpmnElement="SP_1" isExpanded="false">
        <dc:Bounds x="610" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_1_di" bpmnElement="GW_1" isMarkerVisible="true">
        <dc:Bounds x="795" y="225" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="778" y="195" width="84" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_3_di" bpmnElement="T_3">
        <dc:Bounds x="910" y="120" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_4_di" bpmnElement="T_4">
        <dc:Bounds x="910" y="310" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_2_di" bpmnElement="GW_2" isMarkerVisible="true">
        <dc:Bounds x="1095" y="225" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_5_di" bpmnElement="T_5">
        <dc:Bounds x="1210" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_6_di" bpmnElement="T_6">
        <dc:Bounds x="1390" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EE_1_di" bpmnElement="EE_1">
        <dc:Bounds x="1572" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1557" y="275" width="66" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SF_1_di" bpmnElement="SF_1">
        <di:waypoint x="188" y="250" /><di:waypoint x="250" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_2_di" bpmnElement="SF_2">
        <di:waypoint x="370" y="250" /><di:waypoint x="430" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_3_di" bpmnElement="SF_3">
        <di:waypoint x="550" y="250" /><di:waypoint x="610" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_4_di" bpmnElement="SF_4">
        <di:waypoint x="730" y="250" /><di:waypoint x="795" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_5_di" bpmnElement="SF_5">
        <di:waypoint x="820" y="225" /><di:waypoint x="820" y="160" /><di:waypoint x="910" y="160" />
        <bpmndi:BPMNLabel><dc:Bounds x="828" y="188" width="15" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_6_di" bpmnElement="SF_6">
        <di:waypoint x="820" y="275" /><di:waypoint x="820" y="350" /><di:waypoint x="910" y="350" />
        <bpmndi:BPMNLabel><dc:Bounds x="828" y="308" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_7_di" bpmnElement="SF_7">
        <di:waypoint x="1030" y="160" /><di:waypoint x="1120" y="160" /><di:waypoint x="1120" y="225" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_8_di" bpmnElement="SF_8">
        <di:waypoint x="1030" y="350" /><di:waypoint x="1120" y="350" /><di:waypoint x="1120" y="275" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_9_di" bpmnElement="SF_9">
        <di:waypoint x="1145" y="250" /><di:waypoint x="1210" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_10_di" bpmnElement="SF_10">
        <di:waypoint x="1330" y="250" /><di:waypoint x="1390" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_11_di" bpmnElement="SF_11">
        <di:waypoint x="1510" y="250" /><di:waypoint x="1572" y="250" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const generateCustomerInvoice = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_Invoice">
  <bpmn:process id="Process_Invoice" name="Generate Customer Invoice" isExecutable="false">
    <bpmn:startEvent id="SE_1" name="Order&#10;Delivered">
      <bpmn:outgoing>SF_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:serviceTask id="T_1" name="Retrieve Order and Delivery Data">
      <bpmn:incoming>SF_1</bpmn:incoming>
      <bpmn:outgoing>SF_2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:userTask id="T_2" name="Calculate Invoice Amount">
      <bpmn:incoming>SF_2</bpmn:incoming>
      <bpmn:incoming>SF_7</bpmn:incoming>
      <bpmn:outgoing>SF_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:subProcess id="SP_1" name="Validate Invoice Data" triggeredByEvent="false">
      <bpmn:incoming>SF_3</bpmn:incoming>
      <bpmn:outgoing>SF_4</bpmn:outgoing>
    </bpmn:subProcess>
    <bpmn:exclusiveGateway id="GW_1" name="Validation Passed?">
      <bpmn:incoming>SF_4</bpmn:incoming>
      <bpmn:outgoing>SF_5</bpmn:outgoing>
      <bpmn:outgoing>SF_6</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="T_3" name="Correct Invoice Data">
      <bpmn:incoming>SF_6</bpmn:incoming>
      <bpmn:outgoing>SF_7</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="T_4" name="Send Invoice to Customer">
      <bpmn:incoming>SF_5</bpmn:incoming>
      <bpmn:outgoing>SF_8</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="T_5" name="Post Invoice in ERP System">
      <bpmn:incoming>SF_8</bpmn:incoming>
      <bpmn:outgoing>SF_9</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="EE_1" name="Invoice&#10;Posted">
      <bpmn:incoming>SF_9</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SF_1" sourceRef="SE_1" targetRef="T_1" />
    <bpmn:sequenceFlow id="SF_2" sourceRef="T_1" targetRef="T_2" />
    <bpmn:sequenceFlow id="SF_3" sourceRef="T_2" targetRef="SP_1" />
    <bpmn:sequenceFlow id="SF_4" sourceRef="SP_1" targetRef="GW_1" />
    <bpmn:sequenceFlow id="SF_5" name="Yes" sourceRef="GW_1" targetRef="T_4" />
    <bpmn:sequenceFlow id="SF_6" name="No" sourceRef="GW_1" targetRef="T_3" />
    <bpmn:sequenceFlow id="SF_7" sourceRef="T_3" targetRef="T_2" />
    <bpmn:sequenceFlow id="SF_8" sourceRef="T_4" targetRef="T_5" />
    <bpmn:sequenceFlow id="SF_9" sourceRef="T_5" targetRef="EE_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_Invoice">
      <bpmndi:BPMNShape id="SE_1_di" bpmnElement="SE_1">
        <dc:Bounds x="152" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="143" y="275" width="54" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_1_di" bpmnElement="T_1">
        <dc:Bounds x="250" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_2_di" bpmnElement="T_2">
        <dc:Bounds x="430" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SP_1_di" bpmnElement="SP_1" isExpanded="false">
        <dc:Bounds x="610" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_1_di" bpmnElement="GW_1" isMarkerVisible="true">
        <dc:Bounds x="795" y="225" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="775" y="195" width="90" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_3_di" bpmnElement="T_3">
        <dc:Bounds x="770" y="350" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_4_di" bpmnElement="T_4">
        <dc:Bounds x="920" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T_5_di" bpmnElement="T_5">
        <dc:Bounds x="1100" y="210" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EE_1_di" bpmnElement="EE_1">
        <dc:Bounds x="1282" y="232" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1269" y="275" width="62" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SF_1_di" bpmnElement="SF_1">
        <di:waypoint x="188" y="250" /><di:waypoint x="250" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_2_di" bpmnElement="SF_2">
        <di:waypoint x="370" y="250" /><di:waypoint x="430" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_3_di" bpmnElement="SF_3">
        <di:waypoint x="550" y="250" /><di:waypoint x="610" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_4_di" bpmnElement="SF_4">
        <di:waypoint x="730" y="250" /><di:waypoint x="795" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_5_di" bpmnElement="SF_5">
        <di:waypoint x="845" y="250" /><di:waypoint x="920" y="250" />
        <bpmndi:BPMNLabel><dc:Bounds x="874" y="232" width="22" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_6_di" bpmnElement="SF_6">
        <di:waypoint x="820" y="275" /><di:waypoint x="820" y="390" /><di:waypoint x="770" y="390" />
        <bpmndi:BPMNLabel><dc:Bounds x="828" y="328" width="15" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_7_di" bpmnElement="SF_7">
        <di:waypoint x="770" y="390" /><di:waypoint x="490" y="390" /><di:waypoint x="490" y="290" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_8_di" bpmnElement="SF_8">
        <di:waypoint x="1040" y="250" /><di:waypoint x="1100" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SF_9_di" bpmnElement="SF_9">
        <di:waypoint x="1220" y="250" /><di:waypoint x="1282" y="250" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

// Map from ProcessElement.id to BPMN XML
export const BPMN_MODELS: Record<string, string> = {
  's2p-2-1': createPurchaseRequisition,
  's2p-1-3': negotiateAndAwardContract,
  'o2c-3-1': generateCustomerInvoice,
};

export function getBpmnModel(processId: string): string | undefined {
  return BPMN_MODELS[processId];
}
