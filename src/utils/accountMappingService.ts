// Service untuk mengelola mapping nama ke nomor rekening
// Memungkinkan penambahan data tanpa mengubah kode utama

interface AccountMapping {
  nameToAccount: { [key: string]: string };
  lastUpdated: string;
  version: string;
}

class AccountMappingService {
  private static instance: AccountMappingService;
  private mapping: AccountMapping | null = null;
  private isLoading = false;

  private constructor() {}

  public static getInstance(): AccountMappingService {
    if (!AccountMappingService.instance) {
      AccountMappingService.instance = new AccountMappingService();
    }
    return AccountMappingService.instance;
  }

  // Load mapping dari file JSON
  public async loadMapping(): Promise<AccountMapping> {
    if (this.mapping) {
      return this.mapping;
    }

    if (this.isLoading) {
      // Tunggu loading selesai
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.mapping!;
    }

    try {
      this.isLoading = true;
      console.log('📂 Loading account mapping from JSON...');
      
      // Import mapping JSON
      const mappingModule = await import('../data/accountMapping.json');
      this.mapping = mappingModule.default || mappingModule;
      
      console.log('✅ Account mapping loaded:', {
        totalAccounts: Object.keys(this.mapping.nameToAccount).length,
        version: this.mapping.version,
        lastUpdated: this.mapping.lastUpdated
      });
      
      return this.mapping;
    } catch (error) {
      console.error('❌ Failed to load account mapping:', error);
      
      // Fallback ke mapping default
      this.mapping = {
        nameToAccount: {
          'YULIA NINGSIH': '***********8532'
        },
        lastUpdated: new Date().toISOString().split('T')[0],
        version: '1.0-fallback'
      };
      
      console.log('🔄 Using fallback mapping');
      return this.mapping;
    } finally {
      this.isLoading = false;
    }
  }

  // Cari nomor rekening berdasarkan nama
  public async getAccountByName(name: string): Promise<string | null> {
    const mapping = await this.loadMapping();
    const nameUpper = name.toUpperCase().trim();
    
    console.log('🔍 Searching account for name:', nameUpper);
    console.log('🔍 Available names in mapping:', Object.keys(mapping.nameToAccount));
    
    const account = mapping.nameToAccount[nameUpper];
    if (account) {
      console.log('🎯 Account found in mapping:', { name: nameUpper, account });
      return account;
    }
    
    console.log('❌ Account not found in mapping for name:', nameUpper);
    return null;
  }

  // Tambah mapping baru (untuk future enhancement)
  public async addMapping(name: string, account: string): Promise<void> {
    const mapping = await this.loadMapping();
    const nameUpper = name.toUpperCase().trim();
    
    mapping.nameToAccount[nameUpper] = account;
    mapping.lastUpdated = new Date().toISOString().split('T')[0];
    
    console.log('➕ Added new mapping:', { name: nameUpper, account });
    
    // TODO: Implement save to file/database
    // Untuk sekarang hanya simpan di memory
  }

  // Get semua mapping (untuk debugging)
  public async getAllMappings(): Promise<{ [key: string]: string }> {
    const mapping = await this.loadMapping();
    return mapping.nameToAccount;
  }

  // Reload mapping (jika file berubah)
  public async reloadMapping(): Promise<void> {
    this.mapping = null;
    await this.loadMapping();
    console.log('🔄 Account mapping reloaded');
  }
}

export default AccountMappingService;
