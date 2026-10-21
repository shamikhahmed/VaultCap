import UIKit
import UniformTypeIdentifiers
import Capacitor

/// App-local native helpers exposed to JS as `Capacitor.Plugins.VaultNative`
/// (wrapped by js/core/native-bridge.js).
@objc(VaultNativePlugin)
public class VaultNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VaultNativePlugin"
    public let jsName = "VaultNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "printHTML", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "copySecure", returnType: CAPPluginReturnPromise)
    ]

    /// Print an HTML document through the system print sheet.
    /// Resolves `{ ok: true, completed }` (`completed` is false when the user cancels).
    @objc func printHTML(_ call: CAPPluginCall) {
        guard let html = call.getString("html"), !html.isEmpty else {
            call.reject("Missing html")
            return
        }
        let jobName = call.getString("jobName") ?? "VaultCap"

        DispatchQueue.main.async { [weak self] in
            guard let presenter = self?.bridge?.viewController else {
                call.reject("No view controller to present from")
                return
            }
            guard UIPrintInteractionController.isPrintingAvailable else {
                call.reject("Printing is not available on this device")
                return
            }

            let info = UIPrintInfo.printInfo()
            info.outputType = .general
            info.jobName = jobName

            let formatter = UIMarkupTextPrintFormatter(markupText: html)
            formatter.perPageContentInsets = UIEdgeInsets(top: 36, left: 36, bottom: 36, right: 36)

            let controller = UIPrintInteractionController.shared
            controller.printInfo = info
            controller.printFormatter = formatter

            let completion: UIPrintInteractionController.CompletionHandler = { _, completed, error in
                if let error = error {
                    call.reject("Printing failed", nil, error)
                } else {
                    call.resolve(["ok": true, "completed": completed])
                }
            }

            let presented: Bool
            if presenter.traitCollection.userInterfaceIdiom == .pad {
                let view: UIView = presenter.view
                let anchor = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1)
                presented = controller.present(from: anchor, in: view, animated: true, completionHandler: completion)
            } else {
                presented = controller.present(animated: true, completionHandler: completion)
            }
            if !presented {
                call.reject("Could not open the print sheet")
            }
        }
    }

    /// Copy text that must not linger: never synced via Universal Clipboard and
    /// removed by iOS after `seconds` (default 30).
    @objc func copySecure(_ call: CAPPluginCall) {
        guard let text = call.getString("text") else {
            call.reject("Missing text")
            return
        }
        var seconds = call.getDouble("seconds") ?? 30
        if !seconds.isFinite || seconds <= 0 {
            seconds = 30
        }

        DispatchQueue.main.async {
            UIPasteboard.general.setItems(
                [[UTType.plainText.identifier: text]],
                options: [
                    .localOnly: true,
                    .expirationDate: Date().addingTimeInterval(seconds)
                ]
            )
            call.resolve(["ok": true])
        }
    }
}
