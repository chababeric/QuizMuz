import { Link } from '@inertiajs/react';
import React, { useState } from 'react';
import arrowUpIcon from "../../icons/arrowUp.svg";
import arrowDownIcon from "../../icons/arrowDown.svg";
import closeIcon from "../../icons/close.svg";
import menuIcon from "../../icons/menu.svg";
import manageAccountIcon from "../../icons/manage-accounts.svg";
import solIcon from "../../icons/sol.svg";
import overviewIcon from "../../icons/overview.svg";
import generalIcon from "../../icons/general.svg";

export default function AdminLayout({ children, setSelectedComponent }) {
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isPieceOpen, setIsPieceOpen] = useState(false);
    const [isGeneralOpen, setIsGeneralOpen] = useState(false);

    const toggleMenus = (menu) => {
        if (menu === 'account') {
            setIsAccountOpen(!isAccountOpen);
        }
        else if (menu === 'piece') {
            setIsPieceOpen(!isPieceOpen);
        }
        else if (menu === 'menu') {
            setIsMenuOpen(!isMenuOpen);
        }
        else if (menu === 'general') {
            setIsGeneralOpen(!isGeneralOpen);
        }
    };

    return (
        <div className="relative flex min-h-screen">
            <div
                className={`transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-0 left-0 h-full w-64 border-r border-gray-300 flex flex-col bg-white`}>
                <div className="p-4 flex-grow">
                    <div className="font-bold cursor-pointer">
                        <button
                            onClick={() => setSelectedComponent('Overview')}
                            className="block text-black font-bold hover:underline"
                        >
                            <span className="flex flex-row">
                                Vue d'ensemble
                                <img src={overviewIcon} alt={"Overview Icon"} className="w-6 h-6 ml-2" />
                            </span>
                        </button>
                    </div>
                    <div className="mt-4">
                        <div
                            className="flex justify-between items-center font-bold cursor-pointer"
                            onClick={() => toggleMenus('general')}
                        >
                            <span className="flex flex-row">
                                Général
                                <img src={generalIcon} alt={"General Icon"} className="w-6 h-6 ml-2" />
                            </span>
                            <img src={isGeneralOpen ? arrowUpIcon : arrowDownIcon} alt="Toggle Arrow"
                                 className="w-4 h-4"
                            />
                        </div>
                        {isGeneralOpen && (
                            <div className="pl-4 mt-2">
                                <button onClick={() => setSelectedComponent('LevelAccess')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Accès aux niveaux
                                </button>
                                <button onClick={() => setSelectedComponent('AddAdmin')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Gestion des admins
                                </button>
                                <button onClick={() => setSelectedComponent('AddLevel')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Gestion des niveaux
                                </button>
                                <button onClick={() => setSelectedComponent('ManageInstitution')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Gestion des institutions
                                </button>
                                <button onClick={() => setSelectedComponent('ResetScores')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Réinitialiser les scores
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <div
                            className="flex justify-between items-center font-bold cursor-pointer"
                            onClick={() => toggleMenus('account')}
                        >
                            <span className="flex flex-row">
                                Compte
                                <img src={manageAccountIcon} alt={"Manage Account Icon"} className="w-6 h-6 ml-2" />
                            </span>
                            <img src={isAccountOpen ? arrowUpIcon : arrowDownIcon} alt="Toggle Arrow"
                                 className="w-4 h-4"
                            />
                        </div>
                        {isAccountOpen && (
                            <div className="pl-4 mt-2">
                                <button onClick={() => setSelectedComponent('ModifyUsername')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Modifier un nom d'utilisateur
                                </button>
                                <button onClick={() => setSelectedComponent('ModifyPassword')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Modifier un mot de passe
                                </button>
                                <button onClick={() => setSelectedComponent('ModifyAdminKey')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Modifier la clé admin
                                </button>
                                <button onClick={() => setSelectedComponent('DeleteAccount')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Supprimer un compte
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <div
                            className="flex justify-between items-center font-bold cursor-pointer"
                            onClick={() => toggleMenus('piece')}
                        >
                            <span className="flex flex-row">
                                Pièce
                                <img src={solIcon} alt={"Manage Piece Icon"} className="w-7 h-7 ml-2" />
                            </span>
                            <img src={isPieceOpen ? arrowUpIcon : arrowDownIcon} alt="Toggle Arrow"
                                 className="w-4 h-4"
                            />
                        </div>
                        {isPieceOpen && (
                            <div className="pl-4 mt-2">
                                <button onClick={() => setSelectedComponent('ModifyPiece')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Modifier une pièce
                                </button>
                                <button onClick={() => setSelectedComponent('AddPiece')}
                                        className="block py-2 text-gray-800 hover:underline"
                                >
                                    Ajouter une pièce
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4">
                    <Link
                        href={route('welcome')}
                        className="block py-2 text-black font-bold border-b-2 border-blue-500 w-full text-center"
                    >
                        Retour
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="block py-2 text-black font-bold border-b-2 border-red-500 w-full mt-2 text-center"
                    >
                        Déconnexion
                    </Link>
                </div>
            </div>
            <div
                className={`absolute top-4 left-4 transition-transform duration-300 ${isMenuOpen ? 'translate-x-64' : 'translate-x-0'}`}>
                <img
                    src={isMenuOpen ? closeIcon : menuIcon}
                    alt="Menu Toggle"
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => toggleMenus('menu')}
                />
            </div>
            <div
                className={`flex-1 p-4 flex justify-center items-center transition-all duration-300 ${isMenuOpen ? 'ml-64' : 'ml-0'}`}>
                {children}
            </div>
        </div>
    );
}
