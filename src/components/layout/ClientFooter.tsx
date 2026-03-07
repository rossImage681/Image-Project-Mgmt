/**
 * Client-facing footer - subtle IMC branding
 */
export function ClientFooter() {
    return (
        <footer className="bg-white border-t border-border-light py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-sm text-text-secondary">
                    Built by{" "}
                    <a
                        href="https://imagemarketingconsultants.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fuchsia hover:text-bubblegum transition-colors"
                    >
                        Image Marketing
                    </a>
                </p>
            </div>
        </footer>
    );
}
