import { useState } from 'react';
import axios from 'axios';
import { AdminDialog, EmptyState, SectionCard, buttonDanger, buttonSecondary, muted } from "@/Components/AdminUi";
import { RotateCcwIcon } from "@/Components/AppIcons";

export default function ScoresReset({auth, scores, courses = [], getScores, successMessage, setSuccessMessage, errorMessage, setErrorMessage, selectedInstitution, selectedInstitutionId }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const resetScores = async () => {
        closeModal();

        try {
            const response = await axios.post(route('admin.reset-scores'));
            setSuccessMessage(response.data.message);
            setErrorMessage('');

            getScores();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation des scores.');
            setSuccessMessage('');
        }
    };

    // Scores can only be reset for the admin's own institution
    const canEdit = auth.user.institution_id === selectedInstitutionId;
    const courseNames = Object.fromEntries(courses.map((course) => [course.id, course.name]));

    return (
        <SectionCard
            id="scores-title"
            title={`Scores · ${selectedInstitution}`}
            description={`${scores.length} score${scores.length > 1 ? 's' : ''} enregistré${scores.length > 1 ? 's' : ''}`}
            action={canEdit && (
                <button type="button" onClick={openModal} disabled={scores.length === 0} className={buttonDanger}>
                    <RotateCcwIcon className="h-4 w-4"/> Réinitialiser
                </button>
            )}
        >
            {scores.length === 0 ? (
                <EmptyState>Aucun score pour cette institution.</EmptyState>
            ) : (
                <div className="max-h-[480px] overflow-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className={`sticky top-0 bg-gray-50 text-xs uppercase tracking-wide dark:bg-gray-900 ${muted}`}>
                            <tr>
                                <th scope="col" className="w-14 py-3 pl-5 pr-2 font-semibold">#</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Élève</th>
                                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Cours</th>
                                <th scope="col" className="py-3 pl-4 pr-5 text-right font-semibold">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
                            {scores.map((scoreItem, index) => (
                                <tr key={scoreItem.id ?? index}>
                                    <td className={`py-3 pl-5 pr-2 tabular-nums ${muted}`}>{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 dark:text-white">{scoreItem.user.last_name}, {scoreItem.user.first_name}</p>
                                        <p className={`text-xs ${muted}`}>
                                            {scoreItem.user.username}
                                            {courseNames[scoreItem.course_id] && <span className="sm:hidden"> · {courseNames[scoreItem.course_id]}</span>}
                                        </p>
                                    </td>
                                    <td className="hidden px-4 py-3 text-gray-700 dark:text-gray-300 sm:table-cell">{courseNames[scoreItem.course_id] ?? '—'}</td>
                                    <td className="py-3 pl-4 pr-5 text-right font-semibold tabular-nums text-gray-900 dark:text-white">{Number(scoreItem.score).toLocaleString('fr-FR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AdminDialog
                show={isModalOpen}
                onClose={closeModal}
                title="Réinitialiser les scores ?"
                actions={<>
                    <button type="button" onClick={closeModal} className={buttonSecondary}>Annuler</button>
                    <button type="button" onClick={resetScores} className={buttonDanger}>Réinitialiser</button>
                </>}
            >
                <p>Êtes-vous sûr de vouloir <strong className="text-gray-900 dark:text-white">réinitialiser tous les scores</strong> de l'institution <strong className="text-gray-900 dark:text-white">{selectedInstitution}</strong> ?</p>
                <p className="mt-3 font-medium text-red-600 dark:text-red-400">Cette action est irréversible.</p>
            </AdminDialog>
        </SectionCard>
    );
}
