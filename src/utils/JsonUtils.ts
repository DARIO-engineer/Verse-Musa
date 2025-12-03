// src/utils/JsonUtils.ts

export class JsonUtils {
  /**
   * Safe JSON parse que retorna null em caso de erro
   */
  static safeParse<T = any>(jsonString: string | null | undefined): T | null {
    if (!jsonString) return null;
    
    // Verificar valores problemáticos
    if (
      jsonString === 'undefined' || 
      jsonString === 'null' || 
      jsonString === '' ||
      jsonString === 'NaN'
    ) {
      return null;
    }

    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('❌ Erro ao fazer parse JSON:', { 
        jsonString: jsonString.substring(0, 100), 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  }

  /**
   * Safe JSON parse com valor padrão
   */
  static safeParseWithDefault<T>(jsonString: string | null | undefined, defaultValue: T): T {
    const result = this.safeParse<T>(jsonString);
    return result !== null ? result : defaultValue;
  }

  /**
   * Safe JSON stringify
   */
  static safeStringify(obj: any): string | null {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      console.warn('❌ Erro ao fazer stringify JSON:', error);
      return null;
    }
  }

  /**
   * Verificar se uma string é JSON válido
   */
  static isValidJson(str: string | null | undefined): boolean {
    if (!str) return false;
    
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}
