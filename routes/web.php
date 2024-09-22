<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminKeyController;
use App\Http\Controllers\ChordController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\PieceController;
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
    return Inertia::render('GeneralSettings/Edit');
})->middleware(['auth', 'verified', AdminMiddleware::class, CheckSessionTimeout::class, UpdateLastActionTime::class])->name('general.edit');

Route::get('login', [LoginUserController::class, 'create'])->name('login');
Route::post('login', [LoginUserController::class, 'store']);
Route::post('logout', [LoginUserController::class, 'destroy'])->name('logout');

Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
Route::post('register', [RegisteredUserController::class, 'store']);

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
    Route::get('/menufma', function () {
        return Inertia::render('MenuFMA');
    })->name('menufma');
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

Route::get('/quizsolo', function (Illuminate\Http\Request $request) {
    return Inertia::render('QuizSolo', [
        'pieces' => $request->input('pieces'),
        'difficulty' => $request->input('difficulty'),
        'level' => $request->input('level'),
        'courseId' => $request->input('courseId'),
    ]);
})->name('quizsolo')->middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class, UserStats::class]);

Route::get('/quizfma', function (Illuminate\Http\Request $request) {
    return Inertia::render('QuizFMA', [
        'chords' => $request->input('chords'),
        'difficulty' => $request->input('difficulty'),
        'level' => $request->input('level'),
        'courseId' => $request->input('courseId'),
    ]);
})->name('quizfma')->middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class, UserStats::class]);

Route::get('highscores', function (Illuminate\Http\Request $request) {
    return Inertia::render('HighScores', [
        'courseId' => $request->input('courseId'),
    ]);
})->name('highscores')->middleware(['auth', 'verified', CheckSessionTimeout::class, UpdateLastActionTime::class]);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/update-last-action-time', [QuizSoloController::class, 'updateLastActionTime']);

    Route::get('/institutions', [InstitutionController::class, 'index']);
    Route::post('/update-score', [ScoreController::class, 'store']);
    Route::get('/scores', [ScoreController::class, 'getAllScores']);
    Route::get('/all-scores', [ScoreController::class, 'index']);
    Route::get('/api/pieces/level/{level_id}', [PieceController::class, 'getPiecesByLevel']);
    Route::get('/api/chords/level/{level_id}', [ChordController::class, 'getChordsByLevel']);
    Route::get('/api/pieces', [PieceController::class, 'getPiecesById']);
    Route::get('/api/users', [AdminController::class, 'getAllUsers']);
    Route::get('/api/levels', [LevelController::class, 'getAllLevels']);
    Route::get('/api/all-pieces', [PieceController::class, 'getAllPieces']);
    Route::get('/api/pieces-in-reserve', [PieceController::class, 'getPiecesInReserve']);
    Route::post('/increment-total-pieces-played', [UserStats::class, 'incrementTotalPiecesPlayed']);
    Route::post('/set-difficulty', [UserStats::class, 'setDifficulty']);
    Route::post('/updateLastLevel', [LevelController::class, 'updateLastLevel'])->name('updateLastLevel');
    Route::get('/user-score', [ScoreController::class, 'getUserScore'])->name('userScore');

    Route::middleware([AdminMiddleware::class])->group(function () {
        Route::post('/admin/update-username', [AdminController::class, 'updateUsername'])->name('admin.update-username');
        Route::post('/admin/update-password', [AdminController::class, 'updatePassword'])->name('admin.update-password');
        Route::post('/admin/make-admin', [AdminController::class, 'makeAdmin'])->name('admin.make-admin');
        Route::post('/admin/remove-admin', [AdminController::class, 'removeAdmin'])->name('admin.remove-admin');
        Route::post('/admin/remove-level', [AdminController::class, 'removeLevel'])->name('admin.remove-level');
        Route::post('/admin/add-level', [AdminController::class, 'addLevel'])->name('admin.add-level');
        Route::post('/admin/delete-user', [AdminController::class, 'deleteUser'])->name('admin.delete-user');
        Route::post('/admin/remove-institution', [InstitutionController::class, 'removeInstitution'])->name('admin.remove-institution');
        Route::post('/admin/add-institution', [InstitutionController::class, 'store'])->name('admin.add-institution');
        Route::post('/admin/toggle-level-access', [LevelController::class, 'toggleLevelAccess'])->name('admin.toggle-level-access');
        Route::post('/admin/reset-scores', [ScoreController::class, 'resetScores'])->name('admin.reset-scores');
        Route::put('/admin/update-piece/{id}', [PieceController::class, 'update'])->name('admin.update-piece');
        Route::post('/pieces/{id}/move-to-reserve', [PieceController::class, 'moveToReserve'])->name('pieces.moveToReserve');
        Route::post('/pieces/{id}/move-to-pieces', [PieceController::class, 'moveToPieces'])->name('pieces.moveToPieces');
        Route::post('/delete-piece/{id}', [PieceController::class, 'destroy'])->name('delete-piece');
        Route::post('/new-piece', [PieceController::class, 'store']);
        Route::post('/admin_key/validate', [AdminKeyController::class, 'validateKey'])->name('admin_keys.validate');
        Route::post('/admin_key/update', [AdminKeyController::class, 'store'])->name('admin_keys.update');
        Route::get('/admin/total-stats', [UserStatsController::class, 'getTotalStats'])->name('admin.total-stats');
        Route::post('/admin/update-order', [PieceController::class, 'updateOrder'])->name('admin.update-order');
        Route::get('/pieces-info', [PieceController::class, 'getPiecesInfo'])->name('piecesInfo');
    });
});

require __DIR__.'/auth.php';
