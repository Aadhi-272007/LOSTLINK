import Common "common";

module {
  public type ClaimId = Common.ClaimId;
  public type ReportId = Common.ReportId;
  public type Timestamp = Common.Timestamp;
  public type ClaimStatus = Common.ClaimStatus;
  public type ReturnCode = Common.ReturnCode;

  /// A claim filed against a found report.
  public type Claim = {
    id : ClaimId;
    reportId : ReportId;
    claimantName : Text;
    claimantEmail : Text;
    claimantPhone : ?Text;
    proof : Text;
    status : ClaimStatus;
    reviewNote : ?Text;
    returnCodeHash : ?Text;
    returnCodeExpiresAt : ?Timestamp;
    returnCodeUsed : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Public projection of a claim.
  public type ClaimView = {
    id : ClaimId;
    reportId : ReportId;
    claimantName : Text;
    status : ClaimStatus;
    reviewNote : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Input for filing a claim.
  public type ClaimInput = {
    reportId : ReportId;
    claimantName : Text;
    claimantEmail : Text;
    claimantPhone : ?Text;
    proof : Text;
  };

  /// Result of approving a claim: the single-use return code.
  public type ApprovalResult = {
    claim : ClaimView;
    returnCode : ReturnCode;
    expiresAt : Timestamp;
  };

  /// Result of validating a return code.
  public type ReturnResult = {
    claimId : ClaimId;
    reportId : ReportId;
    returnedAt : Timestamp;
  };
};
