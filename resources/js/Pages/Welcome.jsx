import { Link, Head } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <div className="main-app">
            <div className="background-container"></div>
            <Head title="QuizMuz" />
            <div className="relative min-h-screen flex flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                    <header className="flex flex-col items-center gap-2 py-10 lg:flex-row lg:justify-between">
                        <div className="flex justify-center">
                            <h1 className="text-4xl font-bold text-white hover:cursor-default">
                                Bienvenue sur QuizMuz!
                            </h1>
                        </div>
                        <nav className="flex flex-1 justify-end lg:justify-end mt-4 lg:mt-0">
                            {auth.user ? (
                                <>
                                    <Link
                                        href={route('mainmenu')}
                                        className="login-links"
                                    >
                                        Menu Principal
                                    </Link>

                                    {auth.isAdmin && (
                                        <Link
                                            href={route('admincontrol')}
                                            className="login-links"
                                        >
                                            Page Admin
                                        </Link>
                                    )}

                                    <Link
                                        href={route('support')}
                                        className="login-links"
                                    >
                                        Support
                                    </Link>

                                    {/*<Link*/}
                                    {/*    href={route('logout')}*/}
                                    {/*    method="post"*/}
                                    {/*    as="button"*/}
                                    {/*    className="login-links"*/}
                                    {/*>*/}
                                    {/*    Déconnexion*/}
                                    {/*</Link>*/}

                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="login-links"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="login-links"
                                    >
                                        Inscription
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="mt-6">
                        {auth.user && (
                            <p className="text-white text-lg text-justify">
                                Durant les cours de littérature musicale au Conservatoire de Musique de Montréal, les étudiants explorent l'évolution de la
                                musique à travers différentes époques en étudiant les œuvres majeures et les
                                compositeurs influents. Ils analysent des partitions et apprennent à comprendre les
                                styles et les techniques de composition utilisés au fil des siècles.
                                Les cours incluent également des tests d'écoute où les étudiants doivent reconnaître et situer une pièce musicale jouée.
                                Ces tests permettent d'évaluer leur capacité à identifier les caractéristiques stylistiques et techniques des œuvres,
                                ainsi qu'à associer les pièces à leur contexte historique et culturel.
                                <br/><br/>
                                QuizMuz est une plateforme en ligne qui permet aux étudiants de pratiquer pour se préparer à ces tests.
                                Elle offre des quiz interactifs et un module d'entraînement qui simulent les conditions des tests d'écoute réels.
                                Grâce à QuizMuz, les étudiants peuvent s'exercer à reconnaître les œuvres musicales et à identifier tous leurs éléments caractéristiques,
                                ce qui leur permet de renforcer leurs compétences et de gagner en confiance avant les évaluations officielles.
                            </p>
                        )}
                        {!auth.user && (
                            <p className={"text-white text-lg text-center"}>
                                Connectez-vous pour accéder à QuizMuz!
                            </p>
                        )}
                    </main>

                    <footer className="py-16 text-center text-sm text-white hover:cursor-default">
                        QuizMuz v2.1.11 © 2024 - Tous droits réservés
                    </footer>
                </div>
            </div>
        </div>
    );
}
