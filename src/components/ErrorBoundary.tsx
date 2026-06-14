import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#1a0d0d',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div className="sheet" style={{
            maxWidth: '700px',
            width: '100%',
            background: 'var(--p, #f4e8c1)',
            border: '2px double var(--red, #8b1a1a)',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            boxSizing: 'border-box'
          }}>
            <h2 style={{
              fontFamily: "'IM Fell English SC', serif",
              color: 'var(--red, #8b1a1a)',
              fontSize: '22px',
              marginTop: 0,
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid rgba(139, 26, 26, 0.3)',
              paddingBottom: '8px'
            }}>
              🚨 Systemabsturz / Laufzeitfehler
            </h2>
            <p style={{
              fontFamily: "'Crimson Text', serif",
              fontSize: '13px',
              color: 'var(--inkm, #2a2015)',
              lineHeight: 1.5,
              marginBottom: '15px'
            }}>
              Ein schwerwiegender React-Laufzeitfehler ist aufgetreten. Bitte kopiere diesen Fehlerbericht für das Debugging:
            </p>
            
            <div style={{
              background: '#2c1e1e',
              border: '1px solid #8b1a1a',
              borderRadius: '4px',
              padding: '12px',
              color: '#ffc1c1',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '10.5px',
              overflowX: 'auto',
              maxHeight: '300px',
              whiteSpace: 'pre-wrap',
              marginBottom: '20px'
            }}>
              <strong>Fehler:</strong> {this.state.error?.toString()}
              {this.state.errorInfo && (
                <>
                  <br /><br />
                  <strong>Komponenten-Stacktrace:</strong>
                  {this.state.errorInfo.componentStack}
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button 
                className="btn" 
                onClick={() => window.location.reload()}
                style={{ padding: '6px 12px', fontSize: '11px', cursor: 'pointer' }}
              >
                🔄 Seite neu laden
              </button>
              <button 
                className="btn btn-p" 
                onClick={this.handleReset}
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '11px', 
                  cursor: 'pointer',
                  background: 'var(--red, #8b1a1a)',
                  borderColor: 'var(--red, #8b1a1a)',
                  color: 'white'
                }}
              >
                🗑️ App-Daten zurücksetzen &amp; Neuladen
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
