<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminKeyController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\ChordController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\PieceController;
use App\Http\Controllers\QuizFMAController;
use App\Http\Controllers\QuizSoloController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\UserStatsController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\CheckSessionTimeout;
use App\Http\Middleware\UpdateLastActionTime;
use App\Http\Middleware\UserStats;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\LoginUserController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\LevelController;

Route::get('/', function () {
    $user = auth()->user();
    if (!$user) {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'auth' => [
                'user' => null,
                'isAdmin' => false,
            ],
        ]);
    }
    else {
        $isAdmin = $user->administrator()->exists();
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'auth' => [
                'user' => $user,
                'isAdmin' => $isAdmin,
            ],
        ]);
    }
});

Route::get('welcome', function () {
    $user = auth()->user();
    $isAdmin = $user->administrator()->exists();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'auth' => [
            'user' => $user,
            'isAdmin' => $isAdmin,
        ],
    ]);
})->name('welcome');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', AdminMiddleware::class, CheckSessionTimeout::class, UpdateLastActionTime::class])->name('dashboard');

Route::get('general/edit', function () {
    $institution = auth()->user()->institution()->first()->name;
    return Inertia::render('GeneralSettings/Edit',
        [
            'institution' => $institution,
        ]
    );
})->middleware(['auth', 'verified', AdminMiddleware::class, CheckSessionTimeout::class, UpdateLastActionTime::class])->name('general.edit');

Route::get('account/edit', function () {
    return Inertia::render('Account/Edit');
})->middleware(['auth', 'verified', AdminMiddleware::class, CheckSessionTimeout::class, UpdateLastActionTime::class])->name('account.edit');

Route::get('piece/edit', function () {
    return Inertia::render('Piece/Edit');
})->middleware(['auth', 'verified', AdminMiddleware::class, CheckSessionTimeout::class, UpdateLastActionTime::class])->name('piece.edit');

Route::get('chord/edit', function () {
    return Inertia::render('Chord/Edit');
})->middleware(['auth', 'verified', AdminMiddleware::class, CheckSessionTimeout::class, UpdateLastActionTime::class])->name('chord.edit');

Route::get('login', [LoginUserController::class, 'create'])->name('login');
Route::post('login', [LoginUserController::class, 'store']);
Route::post('logout', [LoginUserController::class, 'destroy'])->name('logout');

Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
Route::post('register', [RegisteredUserController::class, 'store']);
Route::get('/institutions', [InstitutionController::class, 'index'])->name('allInstitutions');

Route::get('/admincontrol', function () {
    return Inertia::render('AdminControl');
})->name('admincontrol')->middleware(['auth', 'verified', AdminMiddleware::class, CheckSessionTimeout::class, UpdateLastActionTime::class]);

Route::middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class])->group(function () {
    Route::get('/course', [CourseController::class, 'index'])->name('course');
});

// get the main menu if the user is authenticated
Route::middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class])->group(function () {
    Route::get('/mainmenu/{courseId}', [LevelController::class, 'index'])->name('mainmenu');
});

Route::middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class])->group(function () {
    Route::get('/support', [SupportController::class, 'index'])->name('support');
});

Route::get('/practice', function (Illuminate\Http\Request $request) {
    return Inertia::render('Practice', [
        'level' => $request->input('level'),
        'courseId' => $request->input('courseId'),
        'courseName' => $request->input('courseName'),
    ]);
})->name('practice')->middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class, UserStats::class]);

Route::get('/optionsmenu', function (Illuminate\Http\Request $request) {
    return Inertia::render('OptionsMenu', [
        'level' => $request->input('level'),
        'courseId' => $request->input('courseId'),
        'courseName' => $request->input('courseName'),
    ]);
})->name('optionsmenu')->middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class]);

Route::get('/quizsolo', [QuizSoloController::class, 'show'])
    ->name('quizsolo')
    ->middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class, UserStats::class]);

Route::get('/quizfma', [QuizFMAController::class, 'show'])
    ->name('quizfma')
    ->middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class, UserStats::class]);

Route::get('highscores', function (Illuminate\Http\Request $request) {
    return Inertia::render('HighScores', [
        'courseId' => $request->input('courseId'),
    ]);
})->name('highscores')->middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class]);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/update-last-action-time', [QuizSoloController::class, 'updateLastActionTime'])->name('updateLastActionTime');
    Route::get('/scores', [ScoreController::class, 'getAllScores'])->name('allScores');
    Route::get('/all-scores', [ScoreController::class, 'index']);
    Route::get('/api/pieces/level/{level_id}', [PieceController::class, 'getPiecesByLevel']);
    Route::get('/api/chords/level/{level_id}', [ChordController::class, 'getChordsByLevel']);
    Route::get('/api/pieces', [PieceController::class, 'getPiecesById']);
    Route::get('/api/users', [AdminController::class, 'getAllUsers'])->name('allUsers');
    Route::get('/api/users-institution', [AdminController::class, 'getUsersFromInstitution'])->name('usersFromInstitution');
    Route::get('/api/levels', [LevelController::class, 'getAllLevels'])->name('allLevels');
    Route::get('/levels-from-course', [LevelController::class, 'getLevelsFromCourse'])->name('levelsFromCourse');
    Route::get('/api/all-pieces', [PieceController::class, 'getAllPieces'])->name('allPieces');
    Route::get('/api/all-chords', [ChordController::class, 'getAllChords'])->name('allChords');
    Route::get('/api/fma-levels', [LevelController::class, 'getFMALevels'])->name('fmaLevels');
    Route::get('/api/pieces-in-reserve', [PieceController::class, 'getPiecesInReserve'])->name('piecesInReserve');
    Route::post('/increment-total-pieces-played', [UserStats::class, 'incrementTotalPiecesPlayed']);
    Route::post('/set-difficulty', [UserStats::class, 'setDifficulty']);
    Route::post('/updateLastLevel', [LevelController::class, 'updateLastLevel'])->name('updateLastLevel');
    Route::get('/user-score', [ScoreController::class, 'getUserScore'])->name('userScore');
    Route::get('/all-courses', [CourseController::class, 'getAllCourses'])->name('allCourses');
    Route::get('/pieces/level/{level_id}/no-module', [PieceController::class, 'getPiecesByLevelNoModule']);

    // Route for history mode (solo mode)
    Route::post('/check-answers', [QuizSoloController::class, 'grade'])->name('checkAnswers');
    Route::post('/get-next-piece', [QuizSoloController::class, 'getNextPiece'])->name('getNextPiece');

    // Routes for FMA mode
    Route::post('/check-fma-answers', [QuizFMAController::class, 'grade'])->name('checkFMAAnswers');
    Route::post('/get-next-chord', [QuizFMAController::class, 'getNextChord'])->name('getNextChord');

    // Modules
    Route::get('/api/modules', [ModuleController::class, 'getAllModules'])->name('allModules');
    Route::get('/api/modules/level/{level_id}', [ModuleController::class, 'getModulesByLevel']);

    Route::middleware([AdminMiddleware::class])->group(function () {
        Route::patch('/admin/update-username', [AdminController::class, 'updateUsername'])->name('admin.update-username');
        Route::put('password', [PasswordController::class, 'update'])->name('password.update');
        Route::post('/admin/make-admin', [AdminController::class, 'makeAdmin'])->name('admin.make-admin');
        Route::post('/admin/remove-admin', [AdminController::class, 'removeAdmin'])->name('admin.remove-admin');
        Route::post('/admin/delete-level', [LevelController::class, 'deleteLevel'])->name('admin.delete-level');
        Route::post('/admin/add-level', [LevelController::class, 'addLevel'])->name('admin.add-level');
        Route::post('/admin/delete-user', [AdminController::class, 'deleteUser'])->name('admin.delete-user');
        Route::post('/admin/remove-institution', [InstitutionController::class, 'removeInstitution'])->name('admin.delete-institution');
        Route::post('/admin/add-institution', [InstitutionController::class, 'store'])->name('admin.add-institution');
        Route::post('/admin/add-course', [CourseController::class, 'store'])->name('admin.add-course');
        Route::post('/admin/delete-course', [CourseController::class, 'destroy'])->name('admin.delete-course');
        Route::post('/admin/toggle-level-access', [LevelController::class, 'toggleLevelAccess'])->name('admin.toggle-level-access');
        Route::post('/admin/reset-scores', [ScoreController::class, 'resetScores'])->name('admin.reset-scores');
        Route::patch('/admin/update-piece', [PieceController::class, 'update'])->name('admin.update-piece');
        Route::patch('/admin/update-chord', [ChordController::class, 'update'])->name('admin.update-chord');
        Route::post('/pieces/{id}/move-to-reserve', [PieceController::class, 'moveToReserve'])->name('pieces.moveToReserve');
        Route::delete('/chords/{id}', [ChordController::class, 'destroy'])->name('admin.delete-chord');
        Route::post('/pieces/{id}/move-to-pieces', [PieceController::class, 'moveToPieces'])->name('pieces.moveToPieces');
        Route::post('/delete-piece/{id}', [PieceController::class, 'destroy'])->name('admin.delete-piece');
        Route::post('/new-piece', [PieceController::class, 'store'])->name('admin.new-piece');
        Route::post('/new-chord', [ChordController::class, 'store'])->name('admin.new-chord');
        Route::post('/admin_key/validate', [AdminKeyController::class, 'validateKey'])->name('admin_key.validate');
        Route::post('/admin_key/update', [AdminKeyController::class, 'store'])->name('admin_key.update');
        Route::get('/admin/total-stats', [UserStatsController::class, 'getTotalStats'])->name('admin.total-stats');
        Route::post('/admin/update-order', [PieceController::class, 'updateOrder'])->name('admin.update-order');
        Route::post('/admin/update-chord-order', [ChordController::class, 'updateOrder'])->name('admin.update-chord-order');
        Route::get('/pieces-info', [PieceController::class, 'getPiecesInfo'])->name('piecesInfo');
        Route::post('/admin/find-user', [AdminController::class, 'findUser'])->name('user.find');

//        Pour les Modules
        Route::post('/admin/add-module', [ModuleController::class, 'store'])->name('admin.add-module');
        Route::patch('/admin/update-module', [ModuleController::class, 'update'])->name('admin.update-module');
        Route::post('/admin/delete-module', [ModuleController::class, 'destroy'])->name('admin.delete-module');
        Route::post('/admin/update-module-order', [ModuleController::class, 'updateOrder'])->name('admin.update-module-order');
    });
});

require __DIR__.'/auth.php';
