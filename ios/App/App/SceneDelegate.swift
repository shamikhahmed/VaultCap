import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    /// Opaque brand cover shown while the scene is inactive or backgrounded so the
    /// app switcher snapshot never contains vault content.
    private var privacyCover: UIView?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard (scene as? UIWindowScene) != nil else { return }
    }

    func sceneWillResignActive(_ scene: UIScene) {
        showPrivacyCover()
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        showPrivacyCover()
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        hidePrivacyCover()
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared,
                open: context.url,
                options: [:]
            )
        }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(
            UIApplication.shared,
            continue: userActivity,
            restorationHandler: { _ in }
        )
    }

    // MARK: - Privacy cover

    private func showPrivacyCover() {
        guard let window = window else { return }
        if let cover = privacyCover {
            window.bringSubviewToFront(cover)
            return
        }

        let cover = UIView(frame: window.bounds)
        cover.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        cover.backgroundColor = UIColor(red: 6 / 255, green: 10 / 255, blue: 18 / 255, alpha: 1)
        cover.accessibilityElementsHidden = true

        let mark = UIImageView(image: UIImage(named: "LaunchMark"))
        mark.contentMode = .scaleAspectFit
        mark.translatesAutoresizingMaskIntoConstraints = false
        cover.addSubview(mark)
        NSLayoutConstraint.activate([
            mark.centerXAnchor.constraint(equalTo: cover.centerXAnchor),
            mark.centerYAnchor.constraint(equalTo: cover.centerYAnchor),
            mark.widthAnchor.constraint(equalToConstant: 72),
            mark.heightAnchor.constraint(equalToConstant: 72)
        ])

        // Topmost subview of the window: above the web view and any presented sheet.
        window.addSubview(cover)
        privacyCover = cover
    }

    private func hidePrivacyCover() {
        guard let cover = privacyCover else { return }
        privacyCover = nil
        UIView.animate(withDuration: 0.18, animations: {
            cover.alpha = 0
        }, completion: { _ in
            cover.removeFromSuperview()
        })
    }
}
