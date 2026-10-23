import { loadConfig } from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";

let cachedClient: StorageClient | null = null;

/**
 * Build the platform storage client exactly the way the Caffeine runtime does
 * (`createActorWithConfig`): bucket, gateway URL, backend canister id, project
 * id, then the agent. The gateway authorizes an upload by verifying the IC
 * response certificate returned by the backend canister's
 * `_immutableObjectStorageCreateCertificate` method, so the backend must
 * include the platform object-storage mixin for uploads to succeed.
 */
async function getStorageClient(): Promise<StorageClient> {
  if (cachedClient) return cachedClient;
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => undefined);
  }
  cachedClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  return cachedClient;
}

/**
 * Upload a photo through the platform storage gateway and return its direct
 * URL, which is what the backend stores in the report's `photo` field.
 */
export async function uploadPhoto(
  file: File,
  onProgress?: (percentage: number) => void,
): Promise<string> {
  const client = await getStorageClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await client.putFile(
    bytes,
    onProgress,
    file.type,
    file.name,
  );
  return client.getDirectURL(hash);
}
