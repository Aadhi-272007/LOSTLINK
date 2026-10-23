import Common "common";

module {
  public type ReportId = Common.ReportId;
  public type Timestamp = Common.Timestamp;
  public type ReportKind = Common.ReportKind;
  public type ReportStatus = Common.ReportStatus;

  /// Private contact details, never exposed on public listings.
  public type ContactInfo = {
    name : Text;
    email : Text;
    phone : ?Text;
  };

  /// A stored report. `contact` and `managementCodeHash` are private.
  public type Report = {
    id : ReportId;
    kind : ReportKind;
    title : Text;
    description : Text;
    category : Text;
    location : Text;
    holdingLocation : ?Text;
    occurredAt : Timestamp;
    photo : ?Text;
    contact : ContactInfo;
    managementCodeHash : Text;
    status : ReportStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Public projection of a report with private fields removed.
  public type ReportView = {
    id : ReportId;
    kind : ReportKind;
    title : Text;
    description : Text;
    category : Text;
    location : Text;
    holdingLocation : ?Text;
    occurredAt : Timestamp;
    photo : ?Text;
    status : ReportStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Input for creating a report.
  public type ReportInput = {
    kind : ReportKind;
    title : Text;
    description : Text;
    category : Text;
    location : Text;
    holdingLocation : ?Text;
    occurredAt : Timestamp;
    photo : ?Text;
    contact : ContactInfo;
  };

  /// Input for editing an existing report.
  public type ReportEdit = {
    title : Text;
    description : Text;
    category : Text;
    location : Text;
    holdingLocation : ?Text;
    occurredAt : Timestamp;
    photo : ?Text;
    contact : ContactInfo;
  };

  /// Result of a successful submission: the report plus its private code.
  public type SubmitResult = {
    report : ReportView;
    managementCode : Common.ManagementCode;
  };

  /// Filter and sort options for listing reports.
  public type ReportQuery = {
    kind : ?ReportKind;
    search : ?Text;
    category : ?Text;
    location : ?Text;
    fromDate : ?Timestamp;
    toDate : ?Timestamp;
    sort : SortOrder;
    page : Nat;
    pageSize : Nat;
  };

  public type SortOrder = { #newest; #oldest; #relevance };

  /// A page of report views.
  public type ReportPage = {
    items : [ReportView];
    total : Nat;
    page : Nat;
    pageSize : Nat;
  };
};
