﻿using GameDocumentEngine.Server.Data;
using GameDocumentEngine.Server.Users;
using System.Text.Json.Nodes;

namespace GameDocumentEngine.Server.Documents;

#nullable disable warnings

public class DocumentUserModel : IAuditable
{
	public Guid GameId { get; set; }
	public Guid DocumentId { get; set; }
	public Guid UserId { get; set; }

	public DocumentModel Document { get; set; }
	public UserModel User { get; set; }
	public GameUserModel GameUser { get; set; }

	// Role name from game document type
	public string Role { get; set; }
	// User options for this document
	public JsonNode Options { get; set; }

	public DateTimeOffset CreatedDate { get; private set; }
	public string? CreatedBy { get; private set; }
	public DateTimeOffset LastModifiedDate { get; private set; }
	public string? LastModifiedBy { get; private set; }
}