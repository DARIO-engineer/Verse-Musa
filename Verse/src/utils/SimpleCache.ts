/**
 * Cache simples em memória para reduzir carregamentos desnecessários
 */
class SimpleCache {
  private static cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  /**
   * Definir um item no cache
   */
  static set(key: string, data: any, ttlSeconds: number = 30): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000, // Converter para milissegundos
    });
  }

  /**
   * Obter um item do cache
   */
  static get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      // Só logar cache miss se não for user_profile para evitar spam
      if (key !== 'user_profile') {
        console.log('🔍 Cache miss para:', key);
      }
      return null;
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      if (key !== 'user_profile') {
        console.log('⏰ Cache expirado para:', key);
      }
      this.cache.delete(key);
      return null;
    }

    if (key !== 'user_profile') {
      console.log('✅ Cache hit para:', key, 'dados:', Array.isArray(item.data) ? `${item.data.length} itens` : typeof item.data);
    }
    return item.data;
  }

  /**
   * Verificar se uma chave existe e é válida
   */
  static has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remover um item do cache
   */
  static delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpar todo o cache
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidar cache relacionado a rascunhos (OTIMIZADO)
   */
  static invalidateDrafts(): void {
    const keysToDelete: string[] = [];
    
    Array.from(this.cache.keys()).forEach(key => {
      if (key.includes('drafts') || key.includes('profile') || key.includes('stats')) {
        keysToDelete.push(key);
      }
    });
    
    // Log reduzido - apenas se houver itens para remover
    if (keysToDelete.length > 0 && Math.random() < 0.2) { // Log apenas 20% das vezes
      console.log('🧹 Invalidando cache de rascunhos...');
      console.log('🗑️ Removendo do cache:', keysToDelete);
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Invalidação inteligente - apenas quando necessário
   */
  static smartInvalidate(reason: 'draft_created' | 'draft_updated' | 'draft_deleted' | 'profile_updated'): void {
    const now = Date.now();
    const lastInvalidation = this.get('_last_invalidation') || 0;
    
    // Evitar invalidações muito frequentes (menos de 2 segundos)
    if (now - lastInvalidation < 2000) {
      return;
    }
    
    this.set('_last_invalidation', now, 10);
    
    switch (reason) {
      case 'draft_created':
      case 'draft_updated':
        this.delete('app_drafts');
        break;
      case 'draft_deleted':
        this.invalidateDrafts();
        break;
      case 'profile_updated':
        this.delete('app_profile');
        this.delete('user_profile');
        break;
    }
  }
}

export default SimpleCache;
