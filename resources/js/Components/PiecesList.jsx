import React, { memo } from 'react';
import PieceItem from "@/Components/PieceItem.jsx";

const groupCard = 'relative overflow-hidden rounded-[24px] bg-[#0B0D18] border border-white/[0.08] p-2 md:p-3';

const CountPill = ({ children }) => (
    <span className="shrink-0 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[13px] font-medium text-[#C9CCDA]">
        {children}
    </span>
);

const EmptyState = ({ title, subtitle }) => (
    <div className="relative overflow-hidden rounded-[24px] bg-[#0B0D18] border border-white/[0.08] p-6 md:p-8">
        <p className="text-[18px] font-semibold text-[#F2F3F8]">{title}</p>
        <p className="mt-1 text-[15px] text-[#A9AEC2]">{subtitle}</p>
    </div>
);

const GroupHeader = ({ title, count }) => (
    <div className="flex items-start gap-3 px-3 pt-3 pb-2">
        <h3 className="flex-1 min-w-0 text-[17px] font-semibold leading-snug text-[#F2F3F8]">{title}</h3>
        {count}
    </div>
);

const PiecesList = memo(({
                             courseName,
                             pieces,
                             modules,
                             nonModulePieces,
                             currentPiece,
                             onPieceClick
                         }) => {
    const isFMA = courseName === "Formation Musicale et Auditive";
    const plural = (count) => isFMA
        ? `formule${count > 1 ? 's' : ''}`
        : `pièce${count > 1 ? 's' : ''}`;

    const renderItems = (items) => items.map((item, index) => (
        <PieceItem
            key={item.id}
            piece={item}
            index={index}
            isActive={currentPiece?.id === item.id}
            onClick={onPieceClick}
            courseName={courseName}
            showComposer={!isFMA}
        />
    ));

    const renderModulesWithItems = () => {
        if (modules.length === 0 && nonModulePieces.length === 0) {
            const itemType = isFMA ? "formule" : "pièce";
            const pluralType = isFMA ? "formules" : "pièces";
            return (
                <EmptyState
                    title={`Aucune ${itemType} trouvée pour ce niveau`}
                    subtitle={`Les ${pluralType} apparaîtront ici une fois ajoutées`}
                />
            );
        }

        return (
            <div className="flex flex-col gap-4 md:gap-5">
                {modules.map((moduleData) => {
                    const items = isFMA ? (moduleData.chords || []) : (moduleData.pieces || []);
                    return (
                        <section key={moduleData.module.id} className={groupCard}>
                            <GroupHeader
                                title={moduleData.module.title}
                                count={<CountPill>{items.length} {plural(items.length)}</CountPill>}
                            />
                            {moduleData.module.description && (
                                <p className="px-3 pb-2 text-[14px] leading-relaxed text-[#A9AEC2]">
                                    {moduleData.module.description}
                                </p>
                            )}
                            <div className="mt-1 border-t border-white/[0.06] pt-1">
                                {items.length > 0 ? renderItems(items) : (
                                    <p className="px-3 py-2 text-[14px] text-[#A9AEC2]">
                                        Aucun élément dans ce module.
                                    </p>
                                )}
                            </div>
                        </section>
                    );
                })}

                {nonModulePieces.length > 0 && (
                    <section className={groupCard}>
                        <GroupHeader
                            title={isFMA ? "Formules sans module" : "Pièces sans module"}
                            count={<CountPill>{nonModulePieces.length} {plural(nonModulePieces.length)}</CountPill>}
                        />
                        <div className="mt-1 border-t border-white/[0.06] pt-1">
                            {renderItems(nonModulePieces)}
                        </div>
                    </section>
                )}
            </div>
        );
    };

    const renderFlatList = () => {
        if (pieces.length === 0) {
            return (
                <EmptyState
                    title="Aucune pièce trouvée pour ce niveau"
                    subtitle="Les pièces apparaîtront ici une fois ajoutées"
                />
            );
        }

        return (
            <section className={groupCard}>
                <GroupHeader
                    title={courseName}
                    count={<CountPill>{pieces.length} pièce{pieces.length > 1 ? 's' : ''}</CountPill>}
                />
                <div className="mt-1 border-t border-white/[0.06] pt-1">
                    {renderItems(pieces)}
                </div>
            </section>
        );
    };

    // Use module grouping for both FMA and LitMus; other courses get a flat list
    if (courseName === "Littérature Musicale" || isFMA) {
        return renderModulesWithItems();
    }
    return renderFlatList();
});

PiecesList.displayName = 'PiecesList';

export default PiecesList;
