// src/app/pages/users/service/user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { UserService } from './user.service';
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    UserPageResponse,
    UserSearchFilter,
    ChangePasswordRequest,
    BulkUserAction
} from '../interfaces/user.interface';
import { USER_API_ENDPOINTS } from '../constants/constants';
import {environment} from "../../../../environments/environment";

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;
    let messageService: jasmine.SpyObj<MessageService>;

    const apiUrl = `${environment.apiBaseUrl}${USER_API_ENDPOINTS.BASE}`;

    const mockUser: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+221 77 123 45 67',
        isActive: true,
        isEmailVerified: true,
        lastLogin: '2024-01-01T10:00:00Z',
        loginAttempts: 0,
        createdAt: '2024-01-01T10:00:00Z',
        roles: [
            { id: 1, name: 'ROLE_USER', description: 'Utilisateur standard', isActive: true }
        ],
        fullName: 'Test User'
    };

    const mockPageResponse: UserPageResponse = {
        content: [mockUser],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 1,
        empty: false
    };

    beforeEach(() => {
        const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserService,
                { provide: MessageService, useValue: messageServiceSpy }
            ]
        });

        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
        messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getAllUsers', () => {
        it('should retrieve users with default pagination', () => {
            service.getAllUsers().subscribe(response => {
                expect(response).toEqual(mockPageResponse);
            });

            const req = httpMock.expectOne(`${apiUrl}?page=0&size=10&sortBy=id&sortDir=desc`);
            expect(req.request.method).toBe('GET');
            req.flush(mockPageResponse);
        });

        it('should retrieve users with custom pagination', () => {
            service.getAllUsers(1, 20, 'username', 'asc').subscribe();

            const req = httpMock.expectOne(`${apiUrl}?page=1&size=20&sortBy=username&sortDir=asc`);
            expect(req.request.method).toBe('GET');
            req.flush(mockPageResponse);
        });

        it('should handle errors gracefully', () => {
            service.getAllUsers().subscribe({
                next: () => fail('should have failed'),
                error: (error) => {
                    expect(error).toBeDefined();
                }
            });

            const req = httpMock.expectOne(`${apiUrl}?page=0&size=10&sortBy=id&sortDir=desc`);
            req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error'
            }));
        });
    });

    describe('searchUsers', () => {
        it('should search users with filter', () => {
            const filter: UserSearchFilter = { search: 'test', isActive: true };

            service.searchUsers(filter, 0, 10, 'username', 'asc').subscribe(response => {
                expect(response).toEqual(mockPageResponse);
            });

            const req = httpMock.expectOne(`${apiUrl}/search?page=0&size=10&sortBy=username&sortDir=asc`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(filter);
            req.flush(mockPageResponse);
        });
    });

    describe('createUser', () => {
        it('should create a new user', () => {
            const createRequest: CreateUserRequest = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'password123',
                firstName: 'New',
                lastName: 'User',
                roleIds: [1]
            };

            service.createUser(createRequest).subscribe(response => {
                expect(response).toEqual(mockUser);
            });

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(createRequest);
            req.flush(mockUser);

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Utilisateur créé avec succès'
            }));
        });
    });

    describe('updateUser', () => {
        it('should update an existing user', () => {
            const updateRequest: UpdateUserRequest = {
                email: 'updated@example.com',
                firstName: 'Updated',
                lastName: 'User',
                roleIds: [1]
            };

            service.updateUser(1, updateRequest).subscribe(response => {
                expect(response).toEqual(mockUser);
            });

            const req = httpMock.expectOne(`${apiUrl}/1`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updateRequest);
            req.flush(mockUser);

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Utilisateur mis à jour avec succès'
            }));
        });
    });

    describe('activateUser', () => {
        it('should activate a user', () => {
            service.activateUser(1).subscribe(response => {
                expect(response).toEqual(mockUser);
            });

            const req = httpMock.expectOne(`${apiUrl}/1/activate`);
            expect(req.request.method).toBe('PATCH');
            req.flush(mockUser);

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Utilisateur activé avec succès'
            }));
        });
    });

    describe('deactivateUser', () => {
        it('should deactivate a user', () => {
            service.deactivateUser(1).subscribe(response => {
                expect(response).toEqual(mockUser);
            });

            const req = httpMock.expectOne(`${apiUrl}/1/deactivate`);
            expect(req.request.method).toBe('PATCH');
            req.flush(mockUser);

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Utilisateur désactivé avec succès'
            }));
        });
    });

    describe('unlockUser', () => {
        it('should unlock a user', () => {
            service.unlockUser(1).subscribe(response => {
                expect(response).toEqual(mockUser);
            });

            const req = httpMock.expectOne(`${apiUrl}/1/unlock`);
            expect(req.request.method).toBe('PATCH');
            req.flush(mockUser);

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Compte utilisateur déverrouillé avec succès'
            }));
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', () => {
            const deleteResponse = { message: 'Utilisateur supprimé avec succès' };

            service.deleteUser(1).subscribe(response => {
                expect(response).toEqual(deleteResponse);
            });

            const req = httpMock.expectOne(`${apiUrl}/1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(deleteResponse);

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Utilisateur supprimé avec succès'
            }));
        });
    });

    describe('changePassword', () => {
        it('should change user password', () => {
            const changePasswordRequest: ChangePasswordRequest = {
                userId: 1,
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            };

            const response = { message: 'Mot de passe modifié avec succès' };

            service.changePassword(changePasswordRequest).subscribe(result => {
                expect(result).toEqual(response);
            });

            const req = httpMock.expectOne(`${apiUrl}/change-password`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(changePasswordRequest);
            req.flush(response);

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Mot de passe modifié avec succès'
            }));
        });
    });

    describe('executeBulkAction', () => {
        it('should execute bulk action on users', () => {
            const bulkAction: BulkUserAction = {
                userIds: [1, 2, 3],
                action: 'activate'
            };

            const response = { message: 'Action effectuée avec succès', processedCount: 3 };

            service.executeBulkAction(bulkAction).subscribe(result => {
                expect(result).toEqual(response);
            });

            const req = httpMock.expectOne(`${apiUrl}/bulk-actions`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(bulkAction);
            req.flush(response);

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success'
            }));
        });
    });

    describe('validation methods', () => {
        describe('validateUserData', () => {
            it('should validate valid user data', () => {
                const validUserData: CreateUserRequest = {
                    username: 'validuser',
                    email: 'valid@example.com',
                    password: 'password123',
                    firstName: 'Valid',
                    lastName: 'User',
                    phone: '+221 77 123 45 67',
                    roleIds: [1]
                };

                const result = service.validateUserData(validUserData);
                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            });

            it('should return errors for invalid user data', () => {
                const invalidUserData = {
                    username: 'a', // Trop court
                    email: 'invalid-email', // Format invalide
                    firstName: '', // Vide
                    lastName: 'U' // Trop court
                };

                const result = service.validateUserData(invalidUserData);
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
            });
        });

        describe('isValidEmail', () => {
            it('should validate correct email formats', () => {
                expect(service['isValidEmail']('test@example.com')).toBe(true);
                expect(service['isValidEmail']('user.name@domain.co.uk')).toBe(true);
            });

            it('should reject incorrect email formats', () => {
                expect(service['isValidEmail']('invalid-email')).toBe(false);
                expect(service['isValidEmail']('test@')).toBe(false);
                expect(service['isValidEmail']('@example.com')).toBe(false);
            });
        });

        describe('isValidSenegalPhone', () => {
            it('should validate correct Senegal phone formats', () => {
                expect(service['isValidSenegalPhone']('+221 77 123 45 67')).toBe(true);
                expect(service['isValidSenegalPhone']('00221771234567')).toBe(true);
                expect(service['isValidSenegalPhone']('77 123 45 67')).toBe(true);
            });

            it('should reject incorrect phone formats', () => {
                expect(service['isValidSenegalPhone']('123456789')).toBe(false);
                expect(service['isValidSenegalPhone']('+33 1 23 45 67 89')).toBe(false);
            });
        });
    });

    describe('utility methods', () => {
        describe('filterUsers', () => {
            const users: User[] = [
                { ...mockUser, id: 1, username: 'user1', isActive: true },
                { ...mockUser, id: 2, username: 'user2', isActive: false },
                { ...mockUser, id: 3, username: 'admin', isActive: true }
            ];

            it('should filter users by search term', () => {
                const filter: UserSearchFilter = { search: 'admin' };
                const result = service.filterUsers(users, filter);
                expect(result.length).toBe(1);
                expect(result[0].username).toBe('admin');
            });

            it('should filter users by active status', () => {
                const filter: UserSearchFilter = { isActive: false };
                const result = service.filterUsers(users, filter);
                expect(result.length).toBe(1);
                expect(result[0].username).toBe('user2');
            });
        });

        describe('sortUsers', () => {
            const users: User[] = [
                { ...mockUser, id: 3, username: 'charlie' },
                { ...mockUser, id: 1, username: 'alice' },
                { ...mockUser, id: 2, username: 'bob' }
            ];

            it('should sort users in ascending order', () => {
                const result = service.sortUsers(users, 'username', 'asc');
                expect(result[0].username).toBe('alice');
                expect(result[1].username).toBe('bob');
                expect(result[2].username).toBe('charlie');
            });

            it('should sort users in descending order', () => {
                const result = service.sortUsers(users, 'username', 'desc');
                expect(result[0].username).toBe('charlie');
                expect(result[1].username).toBe('bob');
                expect(result[2].username).toBe('alice');
            });
        });
    });

    describe('state management', () => {
        it('should update loading state', () => {
            let loadingState: boolean;

            service.loading$.subscribe(loading => {
                loadingState = loading;
            });

            service.getAllUsers().subscribe();

            // Pendant la requête
            expect(loadingState!).toBe(true);

            const req = httpMock.expectOne(`${apiUrl}?page=0&size=10&sortBy=id&sortDir=desc`);
            req.flush(mockPageResponse);

            // Après la requête
            expect(loadingState!).toBe(false);
        });

        it('should update selected users', () => {
            const selectedUsers = [mockUser];
            let currentSelection: User[];

            service.selectedUsers$.subscribe(users => {
                currentSelection = users;
            });

            service.updateSelectedUsers(selectedUsers);
            expect(currentSelection!).toEqual(selectedUsers);

            service.clearSelection();
            expect(currentSelection!).toEqual([]);
        });
    });
});
