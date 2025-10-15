// src/utils/NavigationHelper.ts
import { CommonActions, NavigationContainerRef } from '@react-navigation/native';

export class NavigationHelper {
  private static navigationRef: NavigationContainerRef<any> | null = null;
  private static isReady = false;

  static setNavigationRef(ref: NavigationContainerRef<any>) {
    this.navigationRef = ref;
    this.isReady = true;
    console.log('✅ NavigationHelper: Ref configurado e pronto');
  }

  static navigateToEditDraft(draftId: string, originScreen?: 'Home' | 'Obras' | 'Profile') {
    console.log('🧭 Tentando navegar para EditDraft com ID:', draftId, 'origem:', originScreen);
    console.log('🔍 NavigationHelper status:', { 
      hasRef: !!this.navigationRef, 
      isReady: this.isReady 
    });
    
    if (!this.navigationRef || !this.isReady) {
      console.error('❌ NavigationHelper: Ref não configurado ou não pronto, usando fallback');
      return false;
    }

    try {
      // Verificar se já estamos na tab correta
      const currentRoute = this.navigationRef.getCurrentRoute();
      console.log('📍 Rota atual:', currentRoute?.name);
      
      if (originScreen === 'Obras') {
        // Se já estamos em ObrasTab, navegar diretamente para EditDraft
        if (currentRoute?.name === 'MyObras' || currentRoute?.name === 'EditDraft') {
          console.log('🔄 Já estamos em ObrasTab, navegação direta para EditDraft');
          this.navigationRef.dispatch(
            CommonActions.navigate({
              name: 'EditDraft',
              params: { 
                draftId,
                originScreen: 'Obras'
              }
            })
          );
        } else {
          // Navegar para ObrasTab e depois para EditDraft
          this.navigationRef.dispatch(
            CommonActions.navigate({
              name: 'ObrasTab',
              params: {
                screen: 'EditDraft',
                params: { 
                  draftId,
                  originScreen: 'Obras'
                }
              }
            })
          );
        }
      } else {
        // Para outras origens, navegar normalmente
        this.navigationRef.dispatch(
          CommonActions.navigate({
            name: originScreen === 'Home' ? 'HomeTab' : 'ObrasTab',
            params: {
              screen: 'EditDraft',
              params: { 
                draftId,
                originScreen: originScreen || 'Obras'
              }
            }
          })
        );
      }
      
      console.log('✅ Navegação executada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
      return false;
    }
  }

  static navigateToObras() {
    console.log('🧭 Tentando navegar para ObrasTab');
    console.log('🔍 NavigationHelper status:', { 
      hasRef: !!this.navigationRef, 
      isReady: this.isReady 
    });
    
    if (!this.navigationRef || !this.isReady) {
      console.error('❌ NavigationHelper: Ref não configurado ou não pronto');
      return false;
    }

    try {
      this.navigationRef.dispatch(
        CommonActions.navigate({
          name: 'ObrasTab'
        })
      );
      console.log('✅ Navegação para Obras executada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro na navegação para Obras:', error);
      return false;
    }
  }

  static navigateToHome() {
    console.log('🧭 Tentando navegar para HomeTab');
    console.log('🔍 NavigationHelper status:', { 
      hasRef: !!this.navigationRef, 
      isReady: this.isReady 
    });
    
    if (!this.navigationRef || !this.isReady) {
      console.error('❌ NavigationHelper: Ref não configurado ou não pronto');
      return false;
    }

    try {
      this.navigationRef.dispatch(
        CommonActions.navigate({
          name: 'HomeTab'
        })
      );
      console.log('✅ Navegação para Home executada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro na navegação para Home:', error);
      return false;
    }
  }

  static navigateToProfile() {
    console.log('🧭 Tentando navegar para ProfileTab');
    console.log('🔍 NavigationHelper status:', { 
      hasRef: !!this.navigationRef, 
      isReady: this.isReady 
    });
    
    if (!this.navigationRef || !this.isReady) {
      console.error('❌ NavigationHelper: Ref não configurado ou não pronto');
      return false;
    }

    try {
      this.navigationRef.dispatch(
        CommonActions.navigate({
          name: 'ProfileTab'
        })
      );
      console.log('✅ Navegação para Profile executada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro na navegação para Profile:', error);
      return false;
    }
  }

  static navigateBack(originScreen?: 'Home' | 'Obras' | 'Profile') {
    console.log('🔙 Navegando de volta para:', originScreen || 'tela anterior');
    
    switch (originScreen) {
      case 'Home':
        return this.navigateToHome();
      case 'Obras':
        return this.navigateToObras();
      case 'Profile':
        return this.navigateToProfile();
      default:
        // Fallback para Obras se não souber a origem
        return this.navigateToObras();
    }
  }
}
