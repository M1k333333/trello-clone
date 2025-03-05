class BoardPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
  end

  def edit?
    record.user == user
  end

  def show?
    true
  end

  def update?
    edit?
  end

  def destroy?
    update?
  end
end
