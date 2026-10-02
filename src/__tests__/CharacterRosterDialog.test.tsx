import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CharacterRosterDialog } from '../components/player/CharacterRosterDialog';
import { characterService } from '../services/character/CharacterService';

vi.mock('../services/character/CharacterService', () => {
  return {
    characterService: {
      listCharacters: vi.fn(),
      getActiveCharacterId: vi.fn(),
      switchActiveCharacter: vi.fn(),
      saveCurrentPCToCloud: vi.fn(),
      duplicateCharacter: vi.fn(),
      deleteCharacter: vi.fn(),
    }
  };
});

describe('CharacterRosterDialog Component Tests', () => {
  const mockCharacters = [
    {
      id: 'char-1',
      userId: 'user-1',
      name: 'Valeros',
      race: 'human',
      classSummary: 'Fighter 5',
      level: 5,
      hp: { current: 45, max: 45 },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCurrentActive: true,
    },
    {
      id: 'char-2',
      userId: 'user-1',
      name: 'Merisiel',
      race: 'elf',
      classSummary: 'Rogue 5',
      level: 5,
      hp: { current: 30, max: 30 },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCurrentActive: false,
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(characterService.listCharacters).mockResolvedValue(mockCharacters);
    vi.mocked(characterService.getActiveCharacterId).mockReturnValue('char-1');
  });

  it('renders character roster modal with character cards and action bar', async () => {
    render(
      <CharacterRosterDialog
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Character Roster')).toBeInTheDocument();
      expect(screen.getByText('Valeros')).toBeInTheDocument();
      expect(screen.getByText('Merisiel')).toBeInTheDocument();
    });

    expect(screen.getByText(/Save Active to Roster/i)).toBeInTheDocument();
    expect(screen.getByText(/New Character/i)).toBeInTheDocument();
  });

  it('calls saveCurrentPCToCloud when Save Active to Roster button is clicked', async () => {
    vi.mocked(characterService.saveCurrentPCToCloud).mockResolvedValue({
      id: 'char-new',
      userId: 'user-1',
      name: 'New Hero',
      race: 'human',
      classSummary: 'Rogue 1',
      level: 1,
      hp: { current: 10, max: 10 },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCurrentActive: true,
    });

    render(
      <CharacterRosterDialog
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Valeros')).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /Save Active to Roster/i });
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(characterService.saveCurrentPCToCloud).toHaveBeenCalledTimes(1);
    });
  });

  it('filters characters based on search input', async () => {
    render(
      <CharacterRosterDialog
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Valeros')).toBeInTheDocument();
      expect(screen.getByText('Merisiel')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search characters.../i);
    fireEvent.change(searchInput, { target: { value: 'Merisiel' } });

    expect(screen.queryByText('Valeros')).not.toBeInTheDocument();
    expect(screen.getByText('Merisiel')).toBeInTheDocument();
  });
});
